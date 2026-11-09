import { type CalSlot } from '@/getting-started/types/CalSlot';
import { fetchCalSlots } from '@/getting-started/utils/fetchCalSlots';
import { getCalEventTypeReference } from '@/getting-started/utils/getCalEventTypeReference';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

const SLOTS_WINDOW_DAYS = 30;

type GettingStartedBookCallSlotsLoadEffectProps = {
  calendarBookingPageId: string;
  timeZone: string;
  onSlotsLoaded: (slotsByDay: Record<string, CalSlot[]>) => void;
};

export const GettingStartedBookCallSlotsLoadEffect = ({
  calendarBookingPageId,
  timeZone,
  onSlotsLoaded,
}: GettingStartedBookCallSlotsLoadEffectProps) => {
  useEffect(() => {
    const eventTypeReference = getCalEventTypeReference(calendarBookingPageId);

    if (!isDefined(eventTypeReference)) {
      onSlotsLoaded({});

      return;
    }

    const abortController = new AbortController();
    const today = Temporal.Now.plainDateISO(timeZone);

    fetchCalSlots({
      eventTypeReference,
      startDate: today.toString(),
      endDate: today.add({ days: SLOTS_WINDOW_DAYS }).toString(),
      timeZone,
      signal: abortController.signal,
    })
      .then(onSlotsLoaded)
      .catch(() => {
        if (!abortController.signal.aborted) {
          onSlotsLoaded({});
        }
      });

    return () => abortController.abort();
  }, [calendarBookingPageId, timeZone, onSlotsLoaded]);

  return null;
};
