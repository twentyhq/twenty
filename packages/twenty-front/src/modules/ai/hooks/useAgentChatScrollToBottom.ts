import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const SCROLL_BOTTOM_THRESHOLD_PX = 10;

export const useAgentChatScrollToBottom = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const scrollWrapperScrollBottom = useAtomComponentStateValue(
    scrollWrapperScrollBottomComponentState,
    AI_CHAT_SCROLL_WRAPPER_ID,
  );

  const isNearBottom = useMemo(
    () => scrollWrapperScrollBottom <= SCROLL_BOTTOM_THRESHOLD_PX,
    [scrollWrapperScrollBottom],
  );

  const scrollToBottom = useCallback(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();
    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    scrollWrapperElement.scrollTo({
      top: scrollWrapperElement.scrollHeight,
    });
  }, [getScrollWrapperElement]);

  return { scrollToBottom, isNearBottom };
};
