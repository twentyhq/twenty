import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEND_AGENT_CHAT_PUSH_NOTIFICATIONS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications-job-name.constant';
import { type SendAgentChatPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-push-notifications-job.types';
import { AgentChatPushNotificationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-push-notification.service';

@Processor(MessageQueue.notificationQueue)
export class SendAgentChatPushNotificationsJob {
  constructor(
    private readonly agentChatPushNotificationService: AgentChatPushNotificationService,
  ) {}

  @Process(SEND_AGENT_CHAT_PUSH_NOTIFICATIONS_JOB_NAME)
  async handle(data: SendAgentChatPushNotificationsJobData): Promise<void> {
    await this.agentChatPushNotificationService.sendPushNotifications(data);
  }
}
