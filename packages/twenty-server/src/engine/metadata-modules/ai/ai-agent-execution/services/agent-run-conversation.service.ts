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
import { CacheLockException } from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
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
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// long enough to wait for another message being sent, not for a run
const MESSAGE_THREAD_LOCK_MAX_WAIT_MS = 2_000;

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
  ) {}

  withThreadLock<TResult>({
    workspaceId,
    threadId,
    work,
    maxWaitMs = AGENT_RUN_THREAD_LOCK_TTL_MS,
  }: {
    workspaceId: string;
    threadId: string;
    work: () => Promise<TResult>;
    maxWaitMs?: number;
  }): Promise<TResult> {
    return this.cacheLockService.withLock(
      work,
      `agent-run-thread:${workspaceId}:${threadId}`,
      {
        ttl: AGENT_RUN_THREAD_LOCK_TTL_MS,
        ms: AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
        maxRetries: maxWaitMs / AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
      },
    );
  }

  // A member's message waits a moment for a run going on in the conversation, then is refused like
  // one sent while the run waits
  async withThreadLockForMessage<TResult>({
    workspaceId,
    threadId,
    work,
  }: {
    workspaceId: string;
    threadId: string;
    work: () => Promise<TResult>;
  }): Promise<TResult> {
    let isLocked = false;

    try {
      return await this.withThreadLock({
        workspaceId,
        threadId,
        maxWaitMs: MESSAGE_THREAD_LOCK_MAX_WAIT_MS,
        work: () => {
          isLocked = true;

          return work();
        },
      });
    } catch (error) {
      if (!isLocked && error instanceof CacheLockException) {
        throw new AiException(
          'A run is going on in the conversation; send the next message once it has finished',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }

      throw error;
    }
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

    if (!isDefined(existingThread)) {
      await this.threadService.createThread({
        workspaceId,
        workspaceMemberId: null,
        id: threadId,
        title,
      });
    }

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
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    title: string;
    agentId: string | null;
    execution: RecordableAgentExecution;
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
        })
        .catch(async (error: unknown) => {
          await this.turnRecorderService.finishExecutedTurn({
            ...turn,
            error: mapErrorToStreamError(error),
          });

          throw error;
        });

    await this.turnRecorderService.finishExecutedTurn({
      ...turn,
      isAwaitingAnswer,
    });

    // the waiting call is already saved and can be answered from the conversation, so a
    // failure to bring it back to the inbox must not fail the run
    if (isAwaitingAnswer) {
      await this.threadService
        .recordThreadActivity({
          workspaceId,
          threadId,
          text: findLastMessageText(replyParts) ?? title,
        })
        .catch((error: unknown) =>
          this.logger.warn(
            `Could not record waiting activity on thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
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
    await this.turnRecorderService.finish({
      workspaceId,
      turnId,
      status: AgentTurnStatus.FAILED,
      error: mapErrorToStreamError(error),
    });
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
