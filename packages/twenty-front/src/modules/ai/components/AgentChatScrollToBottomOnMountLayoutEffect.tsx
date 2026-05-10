import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useLayoutEffect } from 'react';

export const AgentChatScrollToBottomOnMountLayoutEffect = () => {
  useLayoutEffect(() => {
    scrollAiChatToBottom();
  }, []);

  return null;
};
