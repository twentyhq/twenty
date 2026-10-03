import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  AGENT_RUN_THREAD_LOCK_RETRY_INTERVAL_MS,
  AGENT_RUN_THREAD_LOCK_TTL_MS,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-thread-lock.const';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';

@Injectable()
export class AgentRunConversationService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly cacheLockService: CacheLockService,
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

  async recordTurn({
    workspaceId,
    threadId,
    title,
    agentId,
    applicationId,
    actor,
    messages,
    startedAt,
    execution,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
    agentId: string;
    applicationId: string;
    actor: AgentConversationActor;
    messages: RunAgentMessage[];
    startedAt: Date;
    execution: RecordableAgentExecution;
  }): Promise<void> {
    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id'],
    });

    await this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        if (!isDefined(existingThread)) {
          await scope.insert('agentChatThread', { id: threadId, title });
        }

        const turnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId,
          scope,
        });

        for (const message of messages) {
          await this.conversationWriterService.insertMessage({
            workspaceId,
            threadId,
            turnId,
            role: AgentMessageRole.USER,
            agentId: null,
            senderUserWorkspaceId:
              actor.type === 'user' ? actor.userWorkspaceId : null,
            senderApplicationId: applicationId,
            processedAt: startedAt,
            parts: this.buildUserMessageParts(message),
            scope,
          });
        }

        await this.conversationWriterService.insertExecutionReply({
          workspaceId,
          threadId,
          turnId,
          agentId,
          execution,
          scope,
        });
      },
    );
  }

  private buildUserMessageParts(
    message: RunAgentMessage,
  ): ExtendedUIMessagePart[] {
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
