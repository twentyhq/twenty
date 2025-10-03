import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { hasAlreadyVirtualyRenderedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyVirtualyRenderedUpToRealIndexComponentState';
import { lastScrollMeasurementsComponentState } from '@/object-record/record-table/virtualization/states/lastScrollMeasurementsComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

// TODO: export those constants
export const SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND = 140;
export const TIME_BEFORE_DEACTIVATING_LOW_DETAILS = 300;
export const NUMBER_OF_EVENTS_TO_COMPUTE_AVERAGE = 50;

const TIME_BETWEEN_TWO_SCROLL_HANDLING = 20;
const LAST_SCROLL_DEBOUNCE_TIME = 200;

export const RecordTableVirtualizedRowTreadmillEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const scrollAtRealIndexCallbackState = useRecoilComponentCallbackState(
    scrollAtRealIndexComponentState,
  );

  const lowDetailsActivatedCallbackState = useRecoilComponentCallbackState(
    lowDetailsActivatedComponentState,
  );

  const lastRealIndexSetCallbackState = useRecoilComponentCallbackState(
    hasAlreadyVirtualyRenderedUpToRealIndexComponentState,
  );

  const lastScrollMeasurementsCallbackState = useRecoilComponentCallbackState(
    lastScrollMeasurementsComponentState,
  );

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const virtualizedRowRealIndexByVirtualIndexCallbackState =
    useRecoilComponentCallbackState(
      realIndexByVirtualIndexComponentFamilyState,
    );

  const { triggerFetchPages } = useTriggerFetchPages();

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
      scrollWrapperHTMLElement,
      scrollAtRealIndexCallbackState,
    ],
  );

  const handleScrollDebounced = useDebouncedCallback(
    handleScroll,
    TIME_BETWEEN_TWO_SCROLL_HANDLING,
    {
      leading: true,
      trailing: true,
      maxWait: TIME_BETWEEN_TWO_SCROLL_HANDLING,
    },
  );

  const deactivateLowDetails = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const currentLowDetailsActivated = getSnapshotValue(
          snapshot,
          lowDetailsActivatedCallbackState,
        );

        if (currentLowDetailsActivated !== false) {
          set(lowDetailsActivatedCallbackState, false);
        }
      },
    [lowDetailsActivatedCallbackState],
  );

  const deactivateLowDetailsDebounced = useDebouncedCallback(
    deactivateLowDetails,
    TIME_BEFORE_DEACTIVATING_LOW_DETAILS,
    {
      maxWait: TIME_BEFORE_DEACTIVATING_LOW_DETAILS,
    },
  );

  const activateLowDetails = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const currentLowDetailsActivated = getSnapshotValue(
          snapshot,
          lowDetailsActivatedCallbackState,
        );

        const scrollAtRealIndex = getSnapshotValue(
          snapshot,
          scrollAtRealIndexCallbackState,
        );

        const totalNumberOfRecordsToVirtualize =
          getSnapshotValue(
            snapshot,
            totalNumberOfRecordsToVirtualizeCallbackState,
          ) ?? NUMBER_OF_VIRTUALIZED_ROWS;

        if (
          scrollAtRealIndex < 100 ||
          scrollAtRealIndex > totalNumberOfRecordsToVirtualize - 100
        ) {
          return;
        }

        if (currentLowDetailsActivated !== true) {
          set(lowDetailsActivatedCallbackState, true);
        }

        deactivateLowDetailsDebounced.cancel();
      },
    [
      lowDetailsActivatedCallbackState,
      deactivateLowDetailsDebounced,
      scrollAtRealIndexCallbackState,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  const handleScrollData = useRecoilCallback(
    ({ snapshot, set }) =>
      (scrollEvent: Event) => {
        const distanceFromTop = (scrollEvent.target as any).scrollTop;

        const lastScrollMeasurements = getSnapshotValue(
          snapshot,
          lastScrollMeasurementsCallbackState,
        ).concat();

        lastScrollMeasurements.push({
          scrollToTop: distanceFromTop,
          timestamp: scrollEvent.timeStamp,
        });

        set(lastScrollMeasurementsCallbackState, lastScrollMeasurements);

        if (lastScrollMeasurements.length > 1) {
          const scrollMeasurementsForAverage = lastScrollMeasurements.slice(
            -NUMBER_OF_EVENTS_TO_COMPUTE_AVERAGE,
          );

          const scrollSpeedInPixelsPerSecondSum =
            scrollMeasurementsForAverage.reduce(
              (sum, scrollMeasurement, currentIndex, allMeasurements) => {
                if (currentIndex === 0) {
                  return sum;
                }

                const previousMeasurement = allMeasurements[currentIndex - 1];

                const secondsDifferenceWithPreviousMeasurement =
                  (scrollMeasurement.timestamp -
                    previousMeasurement.timestamp) /
                  1_000;

                const scrollDifferenceWithPreviousMeasurement = Math.abs(
                  scrollMeasurement.scrollToTop -
                    previousMeasurement.scrollToTop,
                );

                const scrollSpeedInPixelsPerSecond =
                  scrollDifferenceWithPreviousMeasurement /
                  secondsDifferenceWithPreviousMeasurement;

                sum += scrollSpeedInPixelsPerSecond;

                return sum;
              },
              0,
            );

          const averageScrollSpeedInPixelsPerSecond =
            scrollSpeedInPixelsPerSecondSum /
            scrollMeasurementsForAverage.length;

          const averageScrollSpeedInRowsPerSecond =
            averageScrollSpeedInPixelsPerSecond / (RECORD_TABLE_ROW_HEIGHT + 1);

          if (
            averageScrollSpeedInRowsPerSecond >
            SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND
          ) {
            activateLowDetails();
          } else {
            deactivateLowDetailsDebounced();

            triggerFetchPages();
          }
        } else {
          triggerFetchPages();
        }
      },
    [
      lastScrollMeasurementsCallbackState,
      triggerFetchPages,
      activateLowDetails,
      deactivateLowDetailsDebounced,
    ],
  );

  const handleAfterLastScroll = useRecoilCallback(
    ({ set }) =>
      (scrollEvent: Event) => {
        deactivateLowDetails();

        handleScroll(scrollEvent);

        triggerFetchPages();

        set(lastScrollMeasurementsCallbackState, []);
      },
    [
      handleScroll,
      triggerFetchPages,
      deactivateLowDetails,
      lastScrollMeasurementsCallbackState,
    ],
  );

  const handleAfterLastScrollDebounced = useDebouncedCallback(
    handleAfterLastScroll,
    LAST_SCROLL_DEBOUNCE_TIME,
  );

  const handleScrollEvent = useCallback(
    (scrollEvent: Event) => {
      handleScrollData(scrollEvent);
      handleScrollDebounced(scrollEvent);
      handleAfterLastScrollDebounced(scrollEvent);
    },
    [handleScrollDebounced, handleScrollData, handleAfterLastScrollDebounced],
  );

  useEffect(() => {
    scrollWrapperHTMLElement?.addEventListener('scroll', handleScrollEvent);

    return () => {
      scrollWrapperHTMLElement?.removeEventListener(
        'scroll',
        handleScrollEvent,
      );
    };
  }, [scrollWrapperHTMLElement, handleScrollEvent]);

  return <></>;
};
