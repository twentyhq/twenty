import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { TOOL_INDEX_DEPENDENT_METADATA_NAMES } from '@/ai/constants/ToolIndexDependentMetadataNames';
import { TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS } from '@/ai/constants/ToolIndexInvalidationDebounceTimeInMs';
import { useInvalidateToolIndex } from '@/ai/hooks/useInvalidateToolIndex';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

export const AgentChatToolIndexInvalidationEffect = () => {
  const { invalidateToolIndex } = useInvalidateToolIndex();

  // Installing an app broadcasts many entities at once; one rebuild is enough
  const debouncedInvalidateToolIndex = useDebouncedCallback(
    invalidateToolIndex,
    TOOL_INDEX_INVALIDATION_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  const handleMetadataOperation = useCallback(
    ({
      metadataName,
    }: MetadataOperationBrowserEventDetail<Record<string, unknown>>) => {
      if (TOOL_INDEX_DEPENDENT_METADATA_NAMES.includes(metadataName)) {
        debouncedInvalidateToolIndex();
      }
    },
    [debouncedInvalidateToolIndex],
  );

  useListenToMetadataOperationBrowserEvent({
    onMetadataOperationBrowserEvent: handleMetadataOperation,
  });

  // Changes broadcast while disconnected are not replayed
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedInvalidateToolIndex,
  });

  return null;
};
