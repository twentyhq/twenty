import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToScopedRelationRecordOperation } from '@/object-record/record-column-scope/hooks/useListenToScopedRelationRecordOperation';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';

export const RecordTableRecordGroupSSEReconnectEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { refetch } = useRecordIndexTableQuery(objectNameSingular);

  const reloadRecordGroup = useCallback(() => {
    void refetch();
  }, [refetch]);

  const debouncedReloadRecordGroup = useDebouncedCallback(
    reloadRecordGroup,
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedReloadRecordGroup,
  });

  useListenToScopedRelationRecordOperation({
    objectNameSingular,
    onScopedRelationRecordOperation: reloadRecordGroup,
    debounceTimeInMs: SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
  });

  return null;
};
