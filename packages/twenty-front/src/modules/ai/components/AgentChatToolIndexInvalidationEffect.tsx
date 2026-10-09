import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { TOOL_INDEX_DEPENDENT_METADATA_NAMES } from '@/ai/constants/ToolIndexDependentMetadataNames';
import { TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS } from '@/ai/constants/ToolIndexInvalidationDebounceTimeInMs';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

// The tool index is read cache-first, so it has to be dropped when what it is
// built from changes: mounted readers refetch it once, later ones on mount
export const AgentChatToolIndexInvalidationEffect = () => {
  const client = useApolloClient();

  // Installing an app broadcasts many entities at once; one rebuild is enough
  const invalidateToolIndex = useDebouncedCallback(
    () => {
      client
        .refetchQueries({
          updateCache: (cache) => {
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'getToolIndex' });
          },
        })
        .catch(() => undefined);
    },
    TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  const handleMetadataOperation = useCallback(
    ({
      metadataName,
    }: MetadataOperationBrowserEventDetail<Record<string, unknown>>) => {
      if (TOOL_INDEX_DEPENDENT_METADATA_NAMES.includes(metadataName)) {
        invalidateToolIndex();
      }
    },
    [invalidateToolIndex],
  );

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: handleMetadataOperation,
  });

  // Changes broadcast while disconnected are not replayed
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: invalidateToolIndex,
  });

  return null;
};
