import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

const SCROLL_BOTTOM_THRESHOLD_PX = 10;

export const useAgentChatScrollToBottom = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const scrollBottom = useAtomComponentValue(
    scrollWrapperScrollBottomComponentState,
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const isNearBottom = scrollBottom <= SCROLL_BOTTOM_THRESHOLD_PX;

  const scrollToBottom = () => {
    const { scrollWrapperElement } = getScrollWrapperElement();
    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    scrollWrapperElement.scrollTo({
      top: scrollWrapperElement.scrollHeight,
    });
  };

  return { scrollToBottom, isNearBottom };
};
