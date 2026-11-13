import { useCallback } from 'react';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentBroadcastRecord } from '@/object-core/agents/types/CoreAgentBroadcastRecord';
import { isCoreAgentEventRelevant } from '@/object-core/agents/utils/isCoreAgentEventRelevant';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

type UseListenToCoreAgentEventsArgs = {
  coreAgentId?: string;
  refetch: () => void;
};

export const useListenToCoreAgentEvents = ({
  coreAgentId,
  refetch,
}: UseListenToCoreAgentEventsArgs) => {
  const onCoreAgentOperation = useCallback(
    (detail: MetadataOperationBrowserEventDetail<CoreAgentBroadcastRecord>) => {
      if (!isCoreAgentEventRelevant(detail, coreAgentId)) {
        return;
      }

      refetch();
    },
    [coreAgentId, refetch],
  );

  useListenToMetadataOperationBrowserEvent<CoreAgentBroadcastRecord>({
    metadataName: 'agent',
    onMetadataOperationBrowserEvent: onCoreAgentOperation,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refetch,
  });
};
