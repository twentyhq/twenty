import { useEffect, useRef } from 'react';
import { type EventOccurrence } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { subscribeToAppEvents } from '../functions/subscribeToAppEvents';

export const useEvent = ({
  event,
  recordId,
  property,
  onEvent,
  onConnected,
}: {
  event: string;
  recordId: string | null;
  property?: string;
  onEvent: (occurrence: EventOccurrence) => void;
  // Runs on every (re)connection; refetch here to catch up on what was missed while disconnected
  onConnected?: () => void;
}): void => {
  const onEventRef = useRef(onEvent);
  const onConnectedRef = useRef(onConnected);

  onEventRef.current = onEvent;
  onConnectedRef.current = onConnected;

  useEffect(() => {
    if (!isDefined(recordId)) {
      return;
    }

    const abortController = new AbortController();

    void subscribeToAppEvents({
      subscriptions: [{ event, recordId, property }],
      onEvent: (occurrence) => onEventRef.current(occurrence),
      onConnected: () => onConnectedRef.current?.(),
      signal: abortController.signal,
    });

    return () => abortController.abort();
  }, [event, recordId, property]);
};
