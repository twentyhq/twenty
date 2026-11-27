import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchCalendarEventTitle } from 'src/front-components/utils/fetch-calendar-event-title.util';

type CalendarEventTitleState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'loaded'; title: string };

export const useCalendarEventTitle = (
  calendarEventId: string | undefined,
): CalendarEventTitleState => {
  const [state, setState] = useState<CalendarEventTitleState>(() =>
    isUndefined(calendarEventId)
      ? { status: 'unavailable' }
      : { status: 'loading' },
  );

  useEffect(() => {
    if (isUndefined(calendarEventId)) {
      setState({ status: 'unavailable' });

      return;
    }

    let isCancelled = false;

    setState({ status: 'loading' });

    fetchCalendarEventTitle({ client: new CoreApiClient(), calendarEventId })
      .then((title) => {
        if (!isCancelled) {
          setState(
            isUndefined(title)
              ? { status: 'unavailable' }
              : { status: 'loaded', title },
          );
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ status: 'unavailable' });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [calendarEventId]);

  return state;
};
