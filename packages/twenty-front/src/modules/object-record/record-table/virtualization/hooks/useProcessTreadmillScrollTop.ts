import { useCallback } from 'react';
import { useStore } from 'jotai';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useProcessTreadmillScrollTop = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const lastScrollPositionCallbackState =
    useRecoilComponentStateCallbackStateV2(lastScrollPositionComponentState);

  const lastRealIndexSetCallbackState = useRecoilComponentStateCallbackStateV2(
    lastRealIndexSetComponentState,
  );

  const scrollAtRealIndexCallbackState = useRecoilComponentStateCallbackStateV2(
    scrollAtRealIndexComponentState,
  );

  const virtualizedRowRealIndexByVirtualIndexCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      realIndexByVirtualIndexComponentFamilyState,
    );

  const store = useStore();

  const processTreadmillScrollTop = useCallback(
    (scrollTop: number) => {
      const distanceFromTop = scrollTop;

      const { scrollWrapperElement } = getScrollWrapperElement();

      const tableScrollWrapperHeight = scrollWrapperElement?.clientHeight ?? 0;

      const lastScrollPosition = store.get(lastScrollPositionCallbackState);

      store.set(lastScrollPositionCallbackState, distanceFromTop);

      const scrollDirection =
        distanceFromTop > lastScrollPosition ? 'downward' : 'upward';

      const numberOfRowsDisplayedInTable = Math.min(
        Math.floor(tableScrollWrapperHeight / (RECORD_TABLE_ROW_HEIGHT + 1)),
        30,
      );

      const halfNumberOfRowsVisible = Math.floor(
        numberOfRowsDisplayedInTable / 2,
      );

      const realIndexAtTheMiddleOfTheTable =
        Math.floor(distanceFromTop / (RECORD_TABLE_ROW_HEIGHT + 1)) +
        halfNumberOfRowsVisible;

      const lastCorrectlySetRealIndex =
        store.get(lastRealIndexSetCallbackState) ??
        numberOfRowsDisplayedInTable;

      store.set(scrollAtRealIndexCallbackState, realIndexAtTheMiddleOfTheTable);

      if (scrollDirection === 'downward') {
        const newTargetRealIndexToReachAtTheBottomOfTheOverscan =
          realIndexAtTheMiddleOfTheTable +
          Math.floor(NUMBER_OF_VIRTUALIZED_ROWS / 2);

        const numberOfRealIndexToSet =
          newTargetRealIndexToReachAtTheBottomOfTheOverscan -
          lastCorrectlySetRealIndex;

        if (numberOfRealIndexToSet <= 0) {
          return;
        }

        for (let i = 0; i < numberOfRealIndexToSet + 1; i++) {
          const realIndexThatWillBeSet = lastCorrectlySetRealIndex + i;

          const correspondingVirtualIndex =
            realIndexThatWillBeSet % NUMBER_OF_VIRTUALIZED_ROWS;

          store.set(
            virtualizedRowRealIndexByVirtualIndexCallbackState({
              virtualIndex: correspondingVirtualIndex,
            }),
            realIndexThatWillBeSet,
          );
        }

        store.set(
          lastRealIndexSetCallbackState,
          lastCorrectlySetRealIndex + numberOfRealIndexToSet,
        );
      } else {
        const newTargetRealIndexToReachAtTheTopOfTheOverscan = Math.max(
          0,
          realIndexAtTheMiddleOfTheTable -
            Math.floor(NUMBER_OF_VIRTUALIZED_ROWS / 2),
        );

        const numberOfRealIndexToSet =
          lastCorrectlySetRealIndex -
          newTargetRealIndexToReachAtTheTopOfTheOverscan;

        if (numberOfRealIndexToSet <= 0) {
          return;
        }

        for (let i = 0; i <= numberOfRealIndexToSet; i++) {
          const realIndexThatWillBeSet = lastCorrectlySetRealIndex - i;

          const correspondingVirtualIndex =
            realIndexThatWillBeSet % NUMBER_OF_VIRTUALIZED_ROWS;

          store.set(
            virtualizedRowRealIndexByVirtualIndexCallbackState({
              virtualIndex: correspondingVirtualIndex,
            }),
            realIndexThatWillBeSet,
          );
        }

        store.set(
          lastRealIndexSetCallbackState,
          lastCorrectlySetRealIndex - numberOfRealIndexToSet,
        );
      }
    },
    [
      lastRealIndexSetCallbackState,
      virtualizedRowRealIndexByVirtualIndexCallbackState,
      lastScrollPositionCallbackState,
      scrollAtRealIndexCallbackState,
      getScrollWrapperElement,
      store,
    ],
  );

  return {
    processTreadmillScrollTop,
  };
};
