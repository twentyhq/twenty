import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { isCoreAgentEventRelevant } from '@/object-core/agents/utils/isCoreAgentEventRelevant';
import { refreshCoreAgentQueries } from '@/object-core/agents/utils/refreshCoreAgentQueries';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const CoreAgentMetadataEventsEffect = () => {
  const apolloClient = useApolloClient();

  const refreshAgents = useCallback(() => {
    void refreshCoreAgentQueries(apolloClient).catch(logError);
  }, [apolloClient]);

  const refreshAgentsForRelevantEvent = useCallback(
    ({
      operation,
    }: MetadataOperationBrowserEventDetail<Pick<CoreAgent, 'id'>>) => {
      const listedAgents =
        apolloClient.readQuery({ query: FindManyAgentsDocument })
          ?.findManyAgents ?? [];

      if (!isCoreAgentEventRelevant({ operation, listedAgents })) {
        return;
      }

      refreshAgents();
    },
    [apolloClient, refreshAgents],
  );

  useListenToMetadataOperationBrowserEvent<Pick<CoreAgent, 'id'>>({
    metadataName: 'agent',
    onMetadataOperationBrowserEvent: refreshAgentsForRelevantEvent,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refreshAgents,
  });

  return null;
};
