import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';

export const scrollAiChatToBottom = () => {
  const scrollWrapperElement = document.getElementById(
    `scroll-wrapper-${AI_CHAT_SCROLL_WRAPPER_ID}`,
  );

  if (scrollWrapperElement) {
    scrollWrapperElement.scrollTop = scrollWrapperElement.scrollHeight;
  }
};
