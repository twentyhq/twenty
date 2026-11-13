import { useDebouncedCallback } from 'use-debounce';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgentRunBroadcastRecord } from '@/object-core/agents/types/CoreAgentRunBroadcastRecord';
import { isCoreAgentRunEventRelevant } from '@/object-core/agents/utils/isCoreAgentRunEventRelevant';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

const RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS = 1000;
const RUN_EVENTS_REFETCH_MAX_WAIT_IN_MS = 5000;

type UseListenToCoreAgentRunEventsArgs = {
  agentId?: string;
  onRunsChanged: () => void;
};

export const useListenToCoreAgentRunEvents = ({
  agentId,
  onRunsChanged,
}: UseListenToCoreAgentRunEventsArgs) => {
  const onRunsChangedDebounced = useDebouncedCallback(
    () => onRunsChanged(),
    RUN_EVENTS_REFETCH_DEBOUNCE_IN_MS,
    { maxWait: RUN_EVENTS_REFETCH_MAX_WAIT_IN_MS },
  );

  useListenToMetadataOperationBrowserEvent<CoreAgentRunBroadcastRecord>({
    metadataName: 'agentTurn',
    onMetadataOperationBrowserEvent: (
      detail: MetadataOperationBrowserEventDetail<CoreAgentRunBroadcastRecord>,
    ) => {
      if (
        isCoreAgentRunEventRelevant({ operation: detail.operation, agentId })
      ) {
        onRunsChangedDebounced();
      }
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentTurnThread',
    operationTypes: ['delete'],
    onMetadataOperationBrowserEvent: onRunsChangedDebounced,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: onRunsChangedDebounced,
  });
};
