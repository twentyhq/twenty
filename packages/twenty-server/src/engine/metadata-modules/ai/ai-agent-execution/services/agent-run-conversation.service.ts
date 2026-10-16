import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
export class AgentRunConversationService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
  ) {}

  // A run holds its conversation's stream while it goes on, as a chat reply does, so nothing else
  // writes to the conversation meanwhile. A stream whose worker died is reaped first
  async claimThread({
    workspaceId,
    threadId,
    title,
    streamId,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
    streamId: string;
  }): Promise<boolean> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    if (isDefined(thread)) {
      const interruptedError = await this.streamRecoveryService.reapDeadStream({
        thread,
        workspaceId,
      });

      // a live stream keeps the conversation, so a claim could only fail
      if (
        isNonEmptyString(thread.activeStreamId) &&
        !isDefined(interruptedError)
      ) {
        return false;
      }
    } else {
      await this.conversationWriterService.runInTransaction(
        workspaceId,
        // two runs starting one keyed conversation can both find it missing
        (scope) =>
          scope.upsert('agentChatThread', { id: threadId, title }, ['id']),
      );
    }

    return this.streamRecoveryService.tryClaimStream({
      workspaceId,
      threadId,
      streamId,
    });
  }

  // The turn is written before the agent runs, so a run in progress or one that fails is on record.
  // Messages members sent while the conversation was busy, or while the run waited, are its input too
  async openTurn({
    workspaceId,
    threadId,
    agentId,
    senderUserWorkspaceId,
    senderApplicationId,
    createdBy,
    messages,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    senderApplicationId: string | null;
    createdBy: ActorMetadata;
    messages: RunAgentMessage[];
  }): Promise<{
    turnId: string;
    promptMessageIds: string[];
    hasTakenQueuedMessages: boolean;
  }> {
    return this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        const turnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId,
          status: AgentTurnStatus.RUNNING,
          createdBy,
          scope,
        });

        const takenMessageCount = await scope.update(
          'agentMessage',
          { threadId, status: AgentMessageStatus.QUEUED },
          {
            status: AgentMessageStatus.SENT,
            turnId,
            processedAt: new Date().toISOString(),
          },
        );

        const promptMessageIds: string[] = [];

        for (const message of messages) {
          const isAssistantMessage = message.role === 'assistant';

          promptMessageIds.push(
            await this.conversationWriterService.insertMessage({
              workspaceId,
              threadId,
              turnId,
              role: isAssistantMessage
                ? AgentMessageRole.ASSISTANT
                : AgentMessageRole.USER,
              agentId: null,
              senderUserWorkspaceId: isAssistantMessage
                ? null
                : senderUserWorkspaceId,
              senderApplicationId: isAssistantMessage
                ? null
                : senderApplicationId,
              parts: this.buildMessageParts(message),
              scope,
            }),
          );
        }

        return {
          turnId,
          promptMessageIds,
          hasTakenQueuedMessages: takenMessageCount > 0,
        };
      },
    );
  }

  private buildMessageParts(message: RunAgentMessage): ExtendedUIMessagePart[] {
    const fileParts = (message.attachments ?? []).map(
      (attachment): ExtendedFileUIPart => ({
        type: 'file',
        mediaType: '',
        filename: attachment.filename,
        url: '',
        fileId: attachment.fileId,
      }),
    );

    return [
      ...(isNonEmptyString(message.content)
        ? [{ type: 'text' as const, text: message.content }]
        : []),
      ...fileParts,
    ];
  }
}
