import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { pinAiChatScrollToBottom } from '@/ai/utils/pinAiChatScrollToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect = () => {
  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
  );

  useLayoutEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    return pinAiChatScrollToBottom({
      scrollWrapperElement,
      onPinningStopped: () =>
        setScrollWrapperScrollBottom(getScrollBottomInPx(scrollWrapperElement)),
    });
  }, [
    aiChatDisplayedThread,
    getScrollWrapperElement,
    setScrollWrapperScrollBottom,
  ]);

  return null;
};
