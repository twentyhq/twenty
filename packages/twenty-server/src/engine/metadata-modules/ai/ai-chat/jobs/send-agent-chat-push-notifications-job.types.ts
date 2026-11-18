import { type AgentChatPushNotificationThread } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-push-notification-thread.type';

export type SendAgentChatPushNotificationsJobData = {
  workspaceId: string;
  thread: AgentChatPushNotificationThread;
};
