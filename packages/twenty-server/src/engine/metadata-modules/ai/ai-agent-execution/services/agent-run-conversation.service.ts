import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { mapAgentRunCallerToToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-run-caller-to-tool-call-workflow-step.util';
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

@Injectable()
export class AgentRunConversationService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly cacheLockService: CacheLockService,
    private readonly turnRecorderService: AgentTurnRecorderService,
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
    agentId: string;
    senderUserWorkspaceId: string | null;
    senderApplicationId: string | null;
    createdBy: ActorMetadata;
    messages: RunAgentMessage[];
  }): Promise<string> {
    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id'],
    });

    return this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        if (!isDefined(existingThread)) {
          await scope.insert('agentChatThread', { id: threadId, title });
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
    agentId,
    execution,
    caller,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    agentId: string | null;
    execution: RecordableAgentExecution;
    caller?: AgentRunCaller;
  }): Promise<{
    isAwaitingAnswer: boolean;
    replyParts: ExtendedUIMessagePart[];
  }> {
    const turn = { workspaceId, threadId, turnId, execution };

    const reply = await this.conversationWriterService
      .insertExecutionReply({
        workspaceId,
        threadId,
        turnId,
        agentId,
        execution,
        workflowStep: isDefined(caller)
          ? mapAgentRunCallerToToolCallWorkflowStep(caller)
          : undefined,
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
      isAwaitingAnswer: reply.isAwaitingAnswer,
    });

    return reply;
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
