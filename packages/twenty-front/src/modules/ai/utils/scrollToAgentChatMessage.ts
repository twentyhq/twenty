export const scrollToAgentChatMessage = (messageId: string) => {
  document
    .querySelector(`[data-agent-chat-message-id="${messageId}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
