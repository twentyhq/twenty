import { gettingStartedBookCallSlotsByDayState } from '@/getting-started/states/gettingStartedBookCallSlotsByDayState';
import { fetchCalSlotsOrThrow } from '@/getting-started/utils/fetchCalSlotsOrThrow';
import { getCalEventTypeReference } from '@/getting-started/utils/getCalEventTypeReference';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { captureException } from '@sentry/react';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

const SLOTS_WINDOW_DAYS = 30;

type GettingStartedBookCallSlotsLoadEffectProps = {
  calendarBookingPageId: string;
  timeZone: string;
};

export const GettingStartedBookCallSlotsLoadEffect = ({
  calendarBookingPageId,
  timeZone,
}: GettingStartedBookCallSlotsLoadEffectProps) => {
  const setGettingStartedBookCallSlotsByDay = useSetAtomState(
    gettingStartedBookCallSlotsByDayState,
  );

  useEffect(() => {
    setGettingStartedBookCallSlotsByDay(null);

    const eventTypeReference = getCalEventTypeReference(calendarBookingPageId);

    if (!isDefined(eventTypeReference)) {
      setGettingStartedBookCallSlotsByDay({});

      return;
    }

    const abortController = new AbortController();
    const today = Temporal.Now.plainDateISO(timeZone);

    fetchCalSlotsOrThrow({
      eventTypeReference,
      startDate: today.toString(),
      endDate: today.add({ days: SLOTS_WINDOW_DAYS }).toString(),
      timeZone,
      signal: abortController.signal,
    })
      .then(setGettingStartedBookCallSlotsByDay)
      .catch((error) => {
        if (abortController.signal.aborted) {
          return;
        }

        captureException(error);
        setGettingStartedBookCallSlotsByDay({});
      });

    return () => abortController.abort();
  }, [calendarBookingPageId, timeZone, setGettingStartedBookCallSlotsByDay]);

  return null;
};
