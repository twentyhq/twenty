import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEND_AGENT_CHAT_WEB_PUSH_NOTIFICATIONS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-web-push-notifications-job-name.constant';
import { type SendAgentChatWebPushNotificationsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/send-agent-chat-web-push-notifications-job.types';
import { AgentChatWebPushNotificationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-web-push-notification.service';

@Processor(MessageQueue.webPushQueue)
export class SendAgentChatWebPushNotificationsJob {
  constructor(
    private readonly agentChatWebPushNotificationService: AgentChatWebPushNotificationService,
  ) {}

  @Process(SEND_AGENT_CHAT_WEB_PUSH_NOTIFICATIONS_JOB_NAME)
  async handle(data: SendAgentChatWebPushNotificationsJobData): Promise<void> {
    await this.agentChatWebPushNotificationService.sendWebPushNotifications(
      data,
    );
  }
}
