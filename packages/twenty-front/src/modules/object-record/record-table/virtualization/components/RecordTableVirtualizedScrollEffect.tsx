import { useCallback, useEffect } from 'react';
import { useStore } from 'jotai';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { ROW_SLOT_COUNT } from '@/object-record/record-table/virtualization/constants/RowSlotCount';
import { useProcessScrollTop } from '@/object-record/record-table/virtualization/hooks/useProcessScrollTop';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { lastScrollMeasurementsComponentState } from '@/object-record/record-table/virtualization/states/lastScrollMeasurementsComponentState';
import { lowDetailsActivatedComponentState } from '@/object-record/record-table/virtualization/states/lowDetailsActivatedComponentState';
import { scrollAtRowIndexComponentState } from '@/object-record/record-table/virtualization/states/scrollAtRowIndexComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useDebouncedCallback } from 'use-debounce';

export const SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_ACTIVATE_LOW_DETAILS = 200;
export const SCROLL_SPEED_THRESHOLD_IN_ROWS_PER_SECOND_TO_DEACTIVATE_LOW_DETAILS = 50;

export const TIME_BEFORE_DEACTIVATING_LOW_DETAILS = 20;
export const NUMBER_OF_EVENTS_TO_COMPUTE_AVERAGE = 10;

const TIME_BETWEEN_TWO_SCROLL_HANDLING = 20;
const LAST_SCROLL_DEBOUNCE_TIME = 300;

export const RecordTableVirtualizedScrollEffect = () => {
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const scrollAtRowIndexCallbackState = useAtomComponentStateCallbackState(
    scrollAtRowIndexComponentState,
  );

  const lowDetailsActivatedCallbackState = useAtomComponentStateCallbackState(
    lowDetailsActivatedComponentState,
  );

  const lastScrollMeasurementsCallbackState =
    useAtomComponentStateCallbackState(lastScrollMeasurementsComponentState);

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const { triggerFetchPages } = useTriggerFetchPages();

  const { processScrollTop } = useProcessScrollTop();

  const store = useStore();

  const handleScrollDebounced = useDebouncedCallback(
    processScrollTop,
    TIME_BETWEEN_TWO_SCROLL_HANDLING,
    {
      leading: true,
      trailing: true,
      maxWait: TIME_BETWEEN_TWO_SCROLL_HANDLING,
    },
  );

  const deactivateLowDetails = useCallback(() => {
    const currentLowDetailsActivated = store.get(
      lowDetailsActivatedCallbackState,
    );

    if (currentLowDetailsActivated !== false) {
      store.set(lowDetailsActivatedCallbackState, false);
    }
  }, [lowDetailsActivatedCallbackState, store]);

  const deactivateLowDetailsDebounced = useDebouncedCallback(
    deactivateLowDetails,
    TIME_BEFORE_DEACTIVATING_LOW_DETAILS,
    {
      maxWait: TIME_BEFORE_DEACTIVATING_LOW_DETAILS,
    },
  );

  const activateLowDetails = useCallback(() => {
    deactivateLowDetailsDebounced.cancel();

    const currentLowDetailsActivated = store.get(
      lowDetailsActivatedCallbackState,
    );

    const scrollAtRowIndex = store.get(scrollAtRowIndexCallbackState);

    const totalNumberOfRows =
      store.get(totalNumberOfRowsCallbackState) ?? ROW_SLOT_COUNT;

    if (scrollAtRowIndex < 100 || scrollAtRowIndex > totalNumberOfRows - 100) {
      return;
    }

    if (currentLowDetailsActivated !== true) {
      store.set(lowDetailsActivatedCallbackState, true);
    }
  }, [
    lowDetailsActivatedCallbackState,
    deactivateLowDetailsDebounced,
    scrollAtRowIndexCallbackState,
    totalNumberOfRowsCallbackState,
    store,
  ]);

  const handleAfterLastScroll = useCallback(
    (scrollTop: number) => {
      deactivateLowDetails();

      processScrollTop(scrollTop);

      triggerFetchPages();

      store.set(lastScrollMeasurementsCallbackState, []);
    },
    [
      processScrollTop,
      triggerFetchPages,
      deactivateLowDetails,
      lastScrollMeasurementsCallbackState,
      store,
    ],
  );

  const handleAfterLastScrollDebounced = useDebouncedCallback(
    handleAfterLastScroll,
    LAST_SCROLL_DEBOUNCE_TIME,
  );

  const handleScrollData = useCallback(
    ({ scrollTop, timeStamp }: { scrollTop: number; timeStamp: number }) => {
      const lastScrollMeasurements = store
        .get(lastScrollMeasurementsCallbackState)
        .concat();

      lastScrollMeasurements.push({
        scrollToTop: scrollTop,
        timestamp: timeStamp,
      });

      store.set(lastScrollMeasurementsCallbackState, lastScrollMeasurements);

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
                (scrollMeasurement.timestamp - previousMeasurement.timestamp) /
                1_000;

              const scrollDifferenceWithPreviousMeasurement = Math.abs(
                scrollMeasurement.scrollToTop - previousMeasurement.scrollToTop,
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
          scrollSpeedInPixelsPerSecondSum / scrollMeasurementsForAverage.length;

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
      store,
    ],
  );

  const handleScrollEvent = useCallback(
    (scrollEvent: Event) => {
      if (!(scrollEvent.target instanceof Element)) {
        return;
      }

      const { scrollTop } = scrollEvent.target;

      handleScrollData({ scrollTop, timeStamp: scrollEvent.timeStamp });
      handleScrollDebounced(scrollTop);
      handleAfterLastScrollDebounced(scrollTop);
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
