import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentChatPushNotificationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-push-notification.service';

export type SendAgentChatPushNotificationsJobData = {
  workspaceId: string;
  threadId: string;
  lastActivityAt: string;
};

@Processor(MessageQueue.pushNotificationQueue)
export class SendAgentChatPushNotificationsJob {
  constructor(
    private readonly agentChatPushNotificationService: AgentChatPushNotificationService,
  ) {}

  @Process(SendAgentChatPushNotificationsJob.name)
  async handle(data: SendAgentChatPushNotificationsJobData): Promise<void> {
    await this.agentChatPushNotificationService.sendPushNotifications(data);
  }
}
