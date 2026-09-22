import { useCallback } from 'react';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreWorkflowBroadcastRecord } from '@/object-core/workflows/types/CoreWorkflowBroadcastRecord';
import { isCoreWorkflowEventRelevant } from '@/object-core/workflows/utils/isCoreWorkflowEventRelevant';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

type UseListenToCoreWorkflowEventsArgs = {
  coreWorkflowId?: string;
  refetch: () => void;
};

export const useListenToCoreWorkflowEvents = ({
  coreWorkflowId,
  refetch,
}: UseListenToCoreWorkflowEventsArgs) => {
  const onCoreWorkflowOperation = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord>,
    ) => {
      if (!isCoreWorkflowEventRelevant(detail, coreWorkflowId)) {
        return;
      }

      refetch();
    },
    [coreWorkflowId, refetch],
  );

  useListenToMetadataOperationBrowserEvent<CoreWorkflowBroadcastRecord>({
    metadataName: 'workflow',
    onMetadataOperationBrowserEvent: onCoreWorkflowOperation,
  });

  useListenToMetadataOperationBrowserEvent<CoreWorkflowBroadcastRecord>({
    metadataName: 'workflowVersion',
    onMetadataOperationBrowserEvent: onCoreWorkflowOperation,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refetch,
  });
};
