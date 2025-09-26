import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { hasAlreadyVirtualyRenderedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyVirtualyRenderedUpToRealIndexComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

export const RecordTableVirtualizedRowTreadmillEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const lastRealIndexSetCallbackState = useRecoilComponentCallbackState(
    hasAlreadyVirtualyRenderedUpToRealIndexComponentState,
  );

  const virtualizedRowRealIndexByVirtualIndexCallbackState =
    useRecoilComponentCallbackState(
      realIndexByVirtualIndexComponentFamilyState,
    );

  const handleScroll = useRecoilCallback(
    ({ snapshot, set }) =>
      (event: Event) => {
        const distanceFromTop = (event.target as any).scrollTop;

        const tableScrollWrapperHeight =
          scrollWrapperHTMLElement?.clientHeight ?? 0;

        const lastScrollPosition = getSnapshotValue(
          snapshot,
          lastScrollPositionCallbackState,
        );

        const scrollDirection =
          distanceFromTop > lastScrollPosition ? 'downward' : 'upward';

        set(lastScrollPositionCallbackState, distanceFromTop);

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
          getSnapshotValue(snapshot, lastRealIndexSetCallbackState) ??
          numberOfRowsDisplayedInTable;

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

            set(
              virtualizedRowRealIndexByVirtualIndexCallbackState({
                virtualIndex: correspondingVirtualIndex,
              }),
              realIndexThatWillBeSet,
            );
          }

          set(
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

            set(
              virtualizedRowRealIndexByVirtualIndexCallbackState({
                virtualIndex: correspondingVirtualIndex,
              }),
              realIndexThatWillBeSet,
            );
          }

          set(
            lastRealIndexSetCallbackState,
            lastCorrectlySetRealIndex - numberOfRealIndexToSet,
          );
        }
      },
    [
      lastRealIndexSetCallbackState,
      virtualizedRowRealIndexByVirtualIndexCallbackState,
      lastScrollPositionCallbackState,
      scrollWrapperHTMLElement,
    ],
  );

  const TIME_BETWEEN_TWO_VIRTUALIZATION_BATCH = 20;

  const handleScrollDebounced = useDebouncedCallback(
    handleScroll,
    TIME_BETWEEN_TWO_VIRTUALIZATION_BATCH,
    {
      leading: true,
      trailing: true,
      maxWait: TIME_BETWEEN_TWO_VIRTUALIZATION_BATCH,
    },
  );

  useEffect(() => {
    scrollWrapperHTMLElement?.addEventListener('scroll', handleScrollDebounced);

    return () => {
      scrollWrapperHTMLElement?.removeEventListener(
        'scroll',
        handleScrollDebounced,
      );
    };
  }, [scrollWrapperHTMLElement, handleScrollDebounced]);

  return null;
};
