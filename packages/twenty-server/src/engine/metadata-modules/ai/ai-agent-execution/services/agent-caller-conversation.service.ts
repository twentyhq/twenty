import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// Opens the conversation of a run a caller drives, such as a workflow step. Kept apart from the
// runner so callers avoid the agent execution and tool dependencies
@Injectable()
export class AgentCallerConversationService {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
  ) {}

  // A conversation the run opens is filed under done, and only comes back to
  // the inbox when the agent needs its member
  async openConversation({
    workspaceId,
    sender,
    title,
    threadKey,
    fallbackThreadKey,
    recipientWorkspaceMemberId,
    fallbackRecipientWorkspaceMemberId = null,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    title: string;
    threadKey: string;
    // where the run writes when the conversation its key names is unavailable
    fallbackThreadKey: string;
    recipientWorkspaceMemberId: string | null;
    // used without a recipient; a member who cannot have the conversation leaves it to no inbox
    fallbackRecipientWorkspaceMemberId?: string | null;
  }): Promise<
    | ({ status: 'OPENED' } & AgentRunConversation)
    // the recipient deleted both the conversation its key names and the fallback one
    | { status: 'DELETED' }
  > {
    const openThreadUnderKey = (key: string) => {
      const openThread = (workspaceMemberId: string | null) =>
        this.agentInboxService.openThread({
          workspaceId,
          sender,
          workspaceMemberId,
          threadKey: key,
          title,
          isArchivedOnCreate: true,
        });

      return isDefined(recipientWorkspaceMemberId)
        ? openThread(recipientWorkspaceMemberId)
        : this.openThreadWithFallbackRecipient({
            fallbackRecipientWorkspaceMemberId,
            openThread,
          });
    };

    const keyedConversation = await openThreadUnderKey(threadKey);

    // a conversation the recipient deleted is not written to again, and one already waiting on an answer
    // or holding a suspended run has no room for another, so this run starts its own
    const isKeyedConversationUnavailable =
      isDefined(keyedConversation.thread.deletedAt) ||
      isDefined(keyedConversation.thread.pendingQuestionMessageId) ||
      isDefined(
        await this.agentRunSuspensionService.findOne({
          workspaceId,
          where: { threadId: keyedConversation.thread.id },
        }),
      );
    const { thread, isCreated } = isKeyedConversationUnavailable
      ? await openThreadUnderKey(fallbackThreadKey)
      : keyedConversation;

    if (isDefined(thread.deletedAt)) {
      return { status: 'DELETED' };
    }

    return { status: 'OPENED', threadId: thread.id, isCreated };
  }

  // a member who cannot have the conversation, such as one who cannot use AI,
  // leaves a conversation no inbox receives
  private async openThreadWithFallbackRecipient({
    fallbackRecipientWorkspaceMemberId,
    openThread,
  }: {
    fallbackRecipientWorkspaceMemberId: string | null;
    openThread: (
      workspaceMemberId: string | null,
    ) => ReturnType<AgentInboxService['openThread']>;
  }): ReturnType<AgentInboxService['openThread']> {
    if (!isDefined(fallbackRecipientWorkspaceMemberId)) {
      return openThread(null);
    }

    try {
      return await openThread(fallbackRecipientWorkspaceMemberId);
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return openThread(null);
      }

      throw error;
    }
  }
}
