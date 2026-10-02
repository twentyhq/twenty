import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { type RunAgentMessage } from 'twenty-shared/application';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
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
  ) {}

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
    await this.ensureThread({ workspaceId, threadId, title });

    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId,
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
      });
    }

    await this.conversationWriterService.insertExecutionReply({
      workspaceId,
      threadId,
      turnId,
      agentId,
      execution,
    });
  }

  private async ensureThread({
    workspaceId,
    threadId,
    title,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
  }): Promise<void> {
    const existingThread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id'],
    });

    if (existingThread) {
      return;
    }

    try {
      await this.threadRepository.insert(workspaceId, { id: threadId, title });
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }
    }
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
