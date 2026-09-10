import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { useChangeQueryListenState } from '@/sse-db-event/hooks/useChangeQueryListenState';
import { captureException } from '@sentry/react';
import { useCallback, useEffect } from 'react';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

export const useListenToEventsForQuery = ({
  queryId,
  operationSignature,
  skip = false,
  onSseReconnected,
}: {
  queryId: string;
  operationSignature:
    | RecordGqlOperationSignature
    | MetadataGqlOperationSignature;
  skip?: boolean;
  onSseReconnected?: () => void | Promise<void>;
}) => {
  const { changeQueryIdListenState } = useChangeQueryListenState();

  useEffect(() => {
    if (skip) {
      return;
    }

    changeQueryIdListenState(true, queryId, operationSignature);

    return () => {
      changeQueryIdListenState(false, queryId, operationSignature);
    };
  }, [changeQueryIdListenState, queryId, operationSignature, skip]);

  const handleSseReconnected = useCallback(() => {
    if (skip || !isDefined(onSseReconnected)) {
      return;
    }

    const captureResyncError = (error: unknown) => {
      captureException(
        new Error(`Failed to resync "${queryId}" after SSE reconnection`, {
          cause: error,
        }),
      );
    };

    try {
      void Promise.resolve(onSseReconnected()).catch(captureResyncError);
    } catch (error) {
      captureResyncError(error);
    }
  }, [onSseReconnected, queryId, skip]);

  const debouncedHandleSseReconnected = useDebouncedCallback(
    handleSseReconnected,
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedHandleSseReconnected,
  });
};
