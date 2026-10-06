import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerFilter } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-filter.type';
import { type AgentRunnerOpenedConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-opened-conversation.type';
import { isToolOutputAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/is-tool-output-awaited-by-caller.util';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const RECENT_MESSAGES_TO_SEARCH_FOR_PENDING_CALL = 50;

// The conversation of a run a caller drives, such as a workflow step: the calls
// the run pauses on name the caller, so an answer or an outcome can find its
// way back to it, and the caller can close them when it stops waiting.
// Kept apart from the runner so callers that only record or cancel avoid the
// agent execution and tool dependencies.
@Injectable()
export class AgentCallerConversationService {
  private readonly logger = new Logger(AgentCallerConversationService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly agentInboxService: AgentInboxService,
    private readonly threadService: AgentChatThreadService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly turnRecorderService: AgentTurnRecorderService,
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
  }): Promise<AgentRunnerOpenedConversation> {
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
    // has no room for another question, so this run starts its own
    const isKeyedConversationUnavailable =
      isDefined(keyedConversation.thread.deletedAt) ||
      isDefined(keyedConversation.thread.pendingQuestionMessageId);
    const { thread, isCreated } = isKeyedConversationUnavailable
      ? await openThreadUnderKey(fallbackThreadKey)
      : keyedConversation;

    if (isDefined(thread.deletedAt)) {
      return { status: 'DELETED' };
    }

    return { status: 'OPENED', threadId: thread.id, isCreated };
  }

  // The turn is written before the agent runs, so a run in progress or one that
  // fails is on record
  async openTurn({
    workspaceId,
    threadId,
    agentId,
    prompt,
    senderUserWorkspaceId,
    createdBy,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    prompt: string | null;
    senderUserWorkspaceId: string | null;
    createdBy: ActorMetadata;
  }): Promise<string> {
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

        if (isDefined(prompt)) {
          await this.conversationWriterService.insertMessage({
            workspaceId,
            threadId,
            turnId,
            role: AgentMessageRole.USER,
            agentId: null,
            senderUserWorkspaceId,
            parts: [{ type: 'text', text: prompt }],
            scope,
          });
        }

        return turnId;
      },
    );
  }

  async closeTurn({
    workspaceId,
    threadId,
    turnId,
    caller,
    title,
    agentId,
    execution,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    caller: AgentRunCaller;
    title: string;
    agentId: string | null;
    execution: RecordableAgentExecution;
  }): Promise<{ isAwaitingAnswer: boolean }> {
    const { isAwaitingAnswer, replyParts } =
      await this.agentRunConversationService.closeTurn({
        workspaceId,
        threadId,
        turnId,
        agentId,
        execution,
        caller,
      });

    if (isAwaitingAnswer) {
      await this.recordWaitingActivity({
        workspaceId,
        threadId,
        text: findLastMessageText(replyParts) ?? title,
      });
    }

    return { isAwaitingAnswer };
  }

  async failTurn({
    workspaceId,
    turnId,
    error,
  }: {
    workspaceId: string;
    turnId: string;
    error: unknown;
  }): Promise<void> {
    await this.agentRunConversationService.failTurn({
      workspaceId,
      turnId,
      error,
    });
  }

  // The paused call stays pending in the conversation until the caller resolves it, then carries the outcome
  async recordWaitOutcome({
    workspaceId,
    threadId,
    caller,
    toolNames,
    toolOutput,
  }: {
    workspaceId: string;
    threadId: string;
    caller: AgentRunCaller;
    toolNames: string[];
    toolOutput: Record<string, unknown>;
  }): Promise<void> {
    // messages can follow the call while it waits, so the latest one may not carry it
    const recentMessages = await this.messageRepository.find(workspaceId, {
      where: { threadId },
      order: { createdAt: 'DESC' },
      take: RECENT_MESSAGES_TO_SEARCH_FOR_PENDING_CALL,
      relations: ['parts'],
    });

    const pendingPart = recentMessages
      .flatMap((message) => message.parts ?? [])
      .find(
        (part) =>
          isDefined(part.toolName) &&
          toolNames.includes(part.toolName) &&
          isAwaitingPausingToolOutput(part.toolOutput) &&
          isToolOutputAwaitedByCaller({ toolOutput: part.toolOutput, caller }),
      );

    if (!isDefined(pendingPart)) {
      throw new AiException(
        'The waiting call could not be found in the conversation',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    await this.messagePartRepository.update(
      workspaceId,
      { id: pendingPart.id },
      { toolOutput },
    );
  }

  // A caller that stops waiting closes the calls its conversations wait on, so
  // they no longer look waiting
  async cancelAwaitingConversations({
    workspaceId,
    threadIds,
    caller,
  }: {
    workspaceId: string;
    threadIds: string[];
    caller: AgentRunCallerFilter;
  }): Promise<void> {
    if (threadIds.length === 0) {
      return;
    }

    // An answer holding a conversation's claim closes its calls itself once it finds its caller gone
    const awaitingThreads = await this.threadRepository.find(workspaceId, {
      where: {
        id: In(threadIds),
        pendingQuestionMessageId: Not(IsNull()),
        activeStreamId: IsNull(),
      },
      select: ['id', 'pendingQuestionMessageId'],
    });

    const threadsAwaitingCaller = await this.filterThreadsAwaitingCaller({
      threads: awaitingThreads,
      caller,
      workspaceId,
    });

    for (const { id, pendingQuestionMessageId } of threadsAwaitingCaller) {
      if (!isDefined(pendingQuestionMessageId)) {
        continue;
      }

      const { affected } = await this.threadRepository.update(
        workspaceId,
        { id, pendingQuestionMessageId, activeStreamId: IsNull() },
        { pendingQuestionMessageId: null },
      );

      if (affected === 0) {
        continue;
      }

      await this.threadRecordEventService.emitPendingQuestionCleared({
        workspaceId,
        threadId: id,
        messageId: pendingQuestionMessageId,
      });

      // the question is already cleared, so its calls must close before anything else can fail
      await closeOpenToolParts({
        messagePartRepository: this.messagePartRepository,
        messageId: pendingQuestionMessageId,
        workspaceId,
      });

      await this.turnRecorderService.endWaitingTurn({
        workspaceId,
        messageId: pendingQuestionMessageId,
        status: AgentTurnStatus.CANCELLED,
      });
    }
  }

  // the member may have moved on to another question in their conversation, which the caller must not close
  private async filterThreadsAwaitingCaller<
    TThread extends { pendingQuestionMessageId: string | null },
  >({
    threads,
    caller,
    workspaceId,
  }: {
    threads: TThread[];
    caller: AgentRunCallerFilter;
    workspaceId: string;
  }): Promise<TThread[]> {
    const pendingMessageIds = threads
      .map((thread) => thread.pendingQuestionMessageId)
      .filter(isDefined);

    if (pendingMessageIds.length === 0) {
      return [];
    }

    const pendingParts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId: In(pendingMessageIds) },
      select: ['messageId', 'toolOutput'],
    });

    const messageIdsAwaitingCaller = new Set(
      pendingParts
        .filter((part) =>
          isToolOutputAwaitedByCaller({ toolOutput: part.toolOutput, caller }),
        )
        .map((part) => part.messageId),
    );

    return threads.filter(
      (thread) =>
        isDefined(thread.pendingQuestionMessageId) &&
        messageIdsAwaitingCaller.has(thread.pendingQuestionMessageId),
    );
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

  // the waiting call is already saved and can be answered from the conversation, so a
  // failure to bring it back to the inbox must not fail the run
  private async recordWaitingActivity(args: {
    workspaceId: string;
    threadId: string;
    text: string;
  }): Promise<void> {
    await this.threadService
      .recordThreadActivity(args)
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not record waiting activity on thread ${args.threadId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
  }
}
