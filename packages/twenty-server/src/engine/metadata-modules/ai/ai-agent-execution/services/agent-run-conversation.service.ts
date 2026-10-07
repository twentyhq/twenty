import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { AgentChatDefaultChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-default-channel.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import {
  mapErrorToStreamError,
  type StreamErrorPayload,
} from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AGENT_TURN_CREDITS_EXHAUSTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-credits-exhausted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import {
  AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
  AGENT_RUN_THREAD_LOCK_TTL_MS,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-thread-lock.const';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';

@Injectable()
export class AgentRunConversationService {
  private readonly logger = new Logger(AgentRunConversationService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly cacheLockService: CacheLockService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly threadService: AgentChatThreadService,
    private readonly defaultChannelService: AgentChatDefaultChannelService,
  ) {}

  withThreadLock<TResult>({
    workspaceId,
    threadId,
    work,
  }: {
    workspaceId: string;
    threadId: string;
    work: () => Promise<TResult>;
  }): Promise<TResult> {
    return this.cacheLockService.withLock(
      work,
      `agent-run-thread:${workspaceId}:${threadId}`,
      {
        ttl: AGENT_RUN_THREAD_LOCK_TTL_MS,
        ms: AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
        maxRetries:
          AGENT_RUN_THREAD_LOCK_TTL_MS /
          AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
      },
    );
  }

  // The turn is written before the agent runs, so a run in progress or one that fails is on record
  async openTurn({
    workspaceId,
    threadId,
    title,
    agentId,
    senderUserWorkspaceId,
    senderApplicationId,
    createdBy,
    messages,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    senderApplicationId: string | null;
    createdBy: ActorMetadata;
    messages: RunAgentMessage[];
  }): Promise<string> {
    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id'],
    });
    const newThreadChannel = isDefined(existingThread)
      ? {}
      : await this.defaultChannelService.findSystemThreadChannel(workspaceId);

    return this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        if (!isDefined(existingThread)) {
          await scope.insert('agentChatThread', {
            id: threadId,
            title,
            ...newThreadChannel,
          });
        }

        const turnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId,
          status: AgentTurnStatus.RUNNING,
          createdBy,
          scope,
        });

        for (const message of messages) {
          const isAssistantMessage = message.role === 'assistant';

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
    title,
    agentId,
    execution,
    isAwaitedByCaller,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    title: string;
    agentId: string | null;
    execution: RecordableAgentExecution;
    // a caller such as a workflow step waits on the calls the run pauses on
    isAwaitedByCaller?: boolean;
  }): Promise<{ isAwaitingAnswer: boolean }> {
    const turn = { workspaceId, threadId, turnId, execution };

    const { isAwaitingAnswer, replyParts } =
      await this.conversationWriterService
        .insertExecutionReply({
          workspaceId,
          threadId,
          turnId,
          agentId,
          execution,
          isAwaitedByCaller,
        })
        .catch(async (error: unknown) => {
          await this.turnRecorderService.finishExecutedTurn({
            ...turn,
            error: mapErrorToStreamError(error),
          });
          await this.recordFailureActivity({
            workspaceId,
            threadId,
            failure: mapErrorToStreamError(error),
          });

          throw error;
        });

    await this.turnRecorderService.finishExecutedTurn({
      ...turn,
      isAwaitingAnswer,
    });

    // The turn fails without throwing when the workspace ran out of credits
    if (execution.hasNoMoreAvailableCredits === true) {
      await this.recordFailureActivity({
        workspaceId,
        threadId,
        failure: AGENT_TURN_CREDITS_EXHAUSTED_ERROR,
      });
    }

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
    threadId,
    turnId,
    error,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    error: unknown;
  }): Promise<void> {
    await this.turnRecorderService.finish({
      workspaceId,
      turnId,
      status: AgentTurnStatus.FAILED,
      error: mapErrorToStreamError(error),
    });
    await this.recordFailureActivity({
      workspaceId,
      threadId,
      failure: mapErrorToStreamError(error),
    });
  }

  // A failed run in a channel comes back for its members, where a chat
  // filed away by default would otherwise hide it
  private async recordFailureActivity({
    workspaceId,
    threadId,
    failure,
  }: {
    workspaceId: string;
    threadId: string;
    failure: StreamErrorPayload;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(thread?.channelId)) {
      return;
    }

    await this.recordWaitingActivity({
      workspaceId,
      threadId,
      text: failure.message,
      threadBefore: thread,
    });
  }

  // the waiting call or the failure is already saved and shows in the conversation, so a
  // failure to bring it back to the inbox must not fail the run
  private async recordWaitingActivity(args: {
    workspaceId: string;
    threadId: string;
    text: string;
    threadBefore?: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    await this.threadService
      .recordThreadActivity(args)
      .catch((error: unknown) =>
        this.logger.warn(
          `Could not record waiting activity on thread ${args.threadId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
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
