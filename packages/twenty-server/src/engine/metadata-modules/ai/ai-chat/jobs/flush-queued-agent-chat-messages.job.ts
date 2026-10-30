import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job-name.constant';
import { type FlushQueuedAgentChatMessagesJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job.types';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';

// messages sent while a run held the conversation are sent once it lets go
@Processor({ queueName: MessageQueue.aiStreamQueue, scope: Scope.REQUEST })
export class FlushQueuedAgentChatMessagesJob {
  constructor(
    private readonly agentChatStreamingService: AgentChatStreamingService,
  ) {}

  @Process(FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME)
  async handle(data: FlushQueuedAgentChatMessagesJobData): Promise<void> {
    await this.agentChatStreamingService.flushNextQueuedMessage(data);
  }
}
