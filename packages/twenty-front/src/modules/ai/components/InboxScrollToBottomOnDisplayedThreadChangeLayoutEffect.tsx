import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { pinInboxScrollToBottom } from '@/ai/utils/pinInboxScrollToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect = () => {
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
  );

  useLayoutEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    return pinInboxScrollToBottom({
      scrollWrapperElement,
      onPinningStopped: () =>
        setScrollWrapperScrollBottom(getScrollBottomInPx(scrollWrapperElement)),
    });
  }, [
    inboxDisplayedThread,
    getScrollWrapperElement,
    setScrollWrapperScrollBottom,
  ]);

  return null;
};
