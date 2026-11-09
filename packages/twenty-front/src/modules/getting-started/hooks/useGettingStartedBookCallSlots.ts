import { type CalSlot } from '@/getting-started/types/CalSlot';
import { fetchCalSlots } from '@/getting-started/utils/fetchCalSlots';
import { getCalEventTypeReference } from '@/getting-started/utils/getCalEventTypeReference';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type LoadedSlots = {
  requestKey: string;
  slotsByDay: Record<string, CalSlot[]>;
};

export const useGettingStartedBookCallSlots = ({
  calendarBookingPageId,
  timeZone,
  startDate,
  endDate,
}: {
  calendarBookingPageId: string;
  timeZone: string;
  startDate: string;
  endDate: string;
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = `${calendarBookingPageId}|${timeZone}|${startDate}|${endDate}|${retryCount}`;
  const [loadedSlots, setLoadedSlots] = useState<LoadedSlots | null>(null);
  const [failedRequestKey, setFailedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    const eventTypeReference = getCalEventTypeReference(calendarBookingPageId);

    if (!isDefined(eventTypeReference)) {
      return;
    }

    const abortController = new AbortController();

    fetchCalSlots({
      eventTypeReference,
      startDate,
      endDate,
      timeZone,
      signal: abortController.signal,
    })
      .then((slotsByDay) => setLoadedSlots({ requestKey, slotsByDay }))
      .catch(() => {
        if (!abortController.signal.aborted) {
          setFailedRequestKey(requestKey);
        }
      });

    return () => abortController.abort();
  }, [calendarBookingPageId, timeZone, startDate, endDate, requestKey]);

  return {
    slotsByDay:
      loadedSlots?.requestKey === requestKey ? loadedSlots.slotsByDay : null,
    hasLoadingFailed: failedRequestKey === requestKey,
    retry: () => setRetryCount(retryCount + 1),
  };
};
