import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';

export const dispatchAgentChatSendMessageEvent = () => {
  window.dispatchEvent(new CustomEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME));
};
