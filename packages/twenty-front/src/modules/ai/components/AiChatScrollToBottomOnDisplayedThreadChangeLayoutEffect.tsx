import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { pinAiChatScrollToBottom } from '@/ai/utils/pinAiChatScrollToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect = () => {
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);

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
