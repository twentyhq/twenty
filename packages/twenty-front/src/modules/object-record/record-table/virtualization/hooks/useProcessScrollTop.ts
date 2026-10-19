import { useStore } from 'jotai';
import { useCallback } from 'react';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { scrollAtRowIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRowIndexComponentState';
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
      const viewportHeight = scrollWrapperElement?.clientHeight ?? 0;
      const rowHeight = RECORD_TABLE_ROW_HEIGHT + 1;

      store.set(lastScrollPositionCallbackState, scrollTop);
      store.set(
        scrollAtRowIndexCallbackState,
        Math.floor(scrollTop / rowHeight) +
          Math.floor(viewportHeight / rowHeight / 2),
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
