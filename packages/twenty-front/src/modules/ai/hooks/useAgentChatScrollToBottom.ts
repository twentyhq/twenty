import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { isDefined } from 'twenty-shared/utils';

export const useAgentChatScrollToBottom = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const scrollToBottom = () => {
    const { scrollWrapperElement } = getScrollWrapperElement();
    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    scrollWrapperElement.scrollTo({
      top: scrollWrapperElement.scrollHeight,
    });
  };

  return { scrollToBottom };
};
