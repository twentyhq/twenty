import { captureException } from '@sentry/react';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CORE_WORKFLOW_EVENT_DEBOUNCE_TIME_IN_MS } from '@/object-core/workflows/constants/CoreWorkflowEventDebounceTimeInMs';
import { CORE_WORKFLOW_EVENT_MAX_WAIT_TIME_IN_MS } from '@/object-core/workflows/constants/CoreWorkflowEventMaxWaitTimeInMs';
import { type CoreWorkflowBroadcastRecord } from '@/object-core/workflows/types/CoreWorkflowBroadcastRecord';
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
import { isCoreWorkflowEventRelevant } from '@/object-core/workflows/utils/isCoreWorkflowEventRelevant';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';

export const useListenToCoreWorkflowEvents = ({
  coreWorkflowId,
}: {
  coreWorkflowId?: string;
} = {}) => {
  const apolloCoreClient = useApolloCoreClient();

  const reconcile = useCallback(async () => {
    try {
      await invalidateCoreWorkflowQueries(apolloCoreClient);
    } catch (error) {
      captureException(
        error instanceof Error
          ? error
          : new Error('Failed to reconcile core workflow queries'),
      );
    }
  }, [apolloCoreClient]);

  const debouncedReconcile = useDebouncedCallback(
    reconcile,
    CORE_WORKFLOW_EVENT_DEBOUNCE_TIME_IN_MS,
    { leading: false, maxWait: CORE_WORKFLOW_EVENT_MAX_WAIT_TIME_IN_MS },
  );

  const handleMetadataOperationBrowserEvent = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord>,
    ) => {
      if (!isCoreWorkflowEventRelevant(detail, coreWorkflowId)) {
        return;
      }

      debouncedReconcile();
    },
    [coreWorkflowId, debouncedReconcile],
  );

  useListenToMetadataOperationBrowserEvent<CoreWorkflowBroadcastRecord>({
    metadataName: 'workflow',
    onMetadataOperationBrowserEvent: handleMetadataOperationBrowserEvent,
  });

  useListenToMetadataOperationBrowserEvent<CoreWorkflowBroadcastRecord>({
    metadataName: 'workflowVersion',
    onMetadataOperationBrowserEvent: handleMetadataOperationBrowserEvent,
  });

  const debouncedResync = useDebouncedCallback(
    reconcile,
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedResync,
  });
};
