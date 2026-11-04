import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect } from 'react';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { refreshCoreAgentQueries } from '@/object-core/agents/utils/refreshCoreAgentQueries';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { logError } from '~/utils/logError';

export const CoreAgentMetadataEventsEffect = () => {
  const apolloClient = useApolloClient();

  const refreshAgents = useCallback(() => {
    void refreshCoreAgentQueries(apolloClient).catch(logError);
  }, [apolloClient]);

  useEffect(refreshAgents, [refreshAgents]);

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agent',
    onMetadataOperationBrowserEvent: refreshAgents,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refreshAgents,
  });

  return null;
};
