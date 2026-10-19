import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { scrollAtRowIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRowIndexComponentState';
import { getRowIndexAtViewportMiddle } from '@/object-record/record-table/virtualization/utils/getRowIndexAtViewportMiddle';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useProcessScrollTop = () => {
  const store = useStore();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );

  const scrollAtRowIndexCallbackState = useAtomComponentStateCallbackState(
    scrollAtRowIndexComponentState,
  );

  const { allocateRowSlots } = useAllocateRowSlots();

  const processScrollTop = useCallback(
    (scrollTop: number) => {
      const { scrollWrapperElement } = getScrollWrapperElement();

      store.set(lastScrollPositionCallbackState, scrollTop);
      store.set(
        scrollAtRowIndexCallbackState,
        getRowIndexAtViewportMiddle({
          scrollTop,
          viewportHeight: scrollWrapperElement?.clientHeight ?? 0,
        }),
      );

      allocateRowSlots();
    },
    [
      allocateRowSlots,
      getScrollWrapperElement,
      lastScrollPositionCallbackState,
      scrollAtRowIndexCallbackState,
      store,
    ],
  );

  return { processScrollTop };
};
