import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { lastRealIndexSetComponentState } from '@/object-record/record-table/virtualization/states/lastRealIndexSetComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useProcessTreadmillScrollTop = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const lastRealIndexSetCallbackState = useRecoilComponentCallbackState(
    lastRealIndexSetComponentState,
  );

  const scrollAtRealIndexCallbackState = useRecoilComponentCallbackState(
    scrollAtRealIndexComponentState,
  );

  const virtualizedRowRealIndexByVirtualIndexCallbackState =
    useRecoilComponentCallbackState(
      realIndexByVirtualIndexComponentFamilyState,
    );

  const processTreadmillScrollTop = useRecoilCallback(
    ({ snapshot, set }) =>
      (scrollTop: number) => {
        const distanceFromTop = scrollTop;

        const { scrollWrapperElement } = getScrollWrapperElement();

        const tableScrollWrapperHeight =
          scrollWrapperElement?.clientHeight ?? 0;

        const lastScrollPosition = getSnapshotValue(
          snapshot,
          lastScrollPositionCallbackState,
        );

        set(lastScrollPositionCallbackState, distanceFromTop);

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
          getSnapshotValue(snapshot, lastRealIndexSetCallbackState) ??
          numberOfRowsDisplayedInTable;

        set(scrollAtRealIndexCallbackState, realIndexAtTheMiddleOfTheTable);

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
      scrollAtRealIndexCallbackState,
      getScrollWrapperElement,
    ],
  );

  return {
    processTreadmillScrollTop,
  };
};
