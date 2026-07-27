import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RECORDS_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseRecordsResyncDebounceTimeInMs';
import { captureException } from '@sentry/react';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const SSERecordsResyncEffect = () => {
  const apolloCoreClient = useApolloCoreClient();

  const resyncRecords = useCallback(() => {
    apolloCoreClient.refetchQueries({ include: 'active' }).catch((error) => {
      captureException(
        new Error('Failed to resync records after SSE reconnection', {
          cause: error instanceof Error ? error : undefined,
        }),
      );
    });
  }, [apolloCoreClient]);

  const debouncedResyncRecords = useDebouncedCallback(
    resyncRecords,
    SSE_RECORDS_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedResyncRecords,
  });

  return null;
};
