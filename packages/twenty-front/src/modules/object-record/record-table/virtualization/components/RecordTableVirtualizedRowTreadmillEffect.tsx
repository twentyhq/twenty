import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { useProcessTreadmillScrollTop } from '@/object-record/record-table/virtualization/hooks/useProcessTreadmillScrollTop';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { lastScrollMeasurementsComponentState } from '@/object-record/record-table/virtualization/states/lastScrollMeasurementsComponentState';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { scrollAtRealIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

// TODO: export those constants
// TODO: break down this effect into multiple smaller effect components
export const SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_ACTIVATE_LOW_DETAILS = 120;
export const SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_DEACTIVATE_LOW_DETAILS = 30;

export const TIME_BEFORE_DEACTIVATING_LOW_DETAILS = 20;
export const NUMBER_OF_EVENTS_TO_COMPUTE_AVERAGE = 10;

const TIME_BETWEEN_TWO_SCROLL_HANDLING = 20;
const LAST_SCROLL_DEBOUNCE_TIME = 300;

export const RecordTableVirtualizedRowTreadmillEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const scrollAtRealIndexCallbackState = useRecoilComponentCallbackState(
    scrollAtRealIndexComponentState,
  );

  const lowDetailsActivatedCallbackState = useRecoilComponentCallbackState(
    lowDetailsActivatedComponentState,
  );

  const lastScrollMeasurementsCallbackState = useRecoilComponentCallbackState(
    lastScrollMeasurementsComponentState,
  );

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const { triggerFetchPages } = useTriggerFetchPages();

  const { processTreadmillScrollTop } = useProcessTreadmillScrollTop();

  const handleScrollDebounced = useDebouncedCallback(
    processTreadmillScrollTop,
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
        deactivateLowDetailsDebounced.cancel();

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
      },
    [
      lowDetailsActivatedCallbackState,
      deactivateLowDetailsDebounced,
      scrollAtRealIndexCallbackState,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  const handleAfterLastScroll = useRecoilCallback(
    ({ set }) =>
      (scrollEvent: Event) => {
        deactivateLowDetails();

        processTreadmillScrollTop((scrollEvent.target as any).scrollTop);

        triggerFetchPages();

        set(lastScrollMeasurementsCallbackState, []);
      },
    [
      processTreadmillScrollTop,
      triggerFetchPages,
      deactivateLowDetails,
      lastScrollMeasurementsCallbackState,
    ],
  );

  const handleAfterLastScrollDebounced = useDebouncedCallback(
    handleAfterLastScroll,
    LAST_SCROLL_DEBOUNCE_TIME,
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
            SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_ACTIVATE_LOW_DETAILS
          ) {
            activateLowDetails();
            handleAfterLastScrollDebounced.cancel();
          } else if (
            averageScrollSpeedInRowsPerSecond <
            SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_DEACTIVATE_LOW_DETAILS
          ) {
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
      handleAfterLastScrollDebounced,
    ],
  );

  const handleScrollEvent = useCallback(
    (scrollEvent: Event) => {
      handleScrollData(scrollEvent);
      handleScrollDebounced((scrollEvent.target as any).scrollTop);
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
