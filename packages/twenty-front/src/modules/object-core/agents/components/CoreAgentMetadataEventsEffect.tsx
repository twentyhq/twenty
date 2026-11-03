import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import {
  FindManyAgentsDocument,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const getAffectedAgentId = (
  operation: MetadataOperation<Pick<CoreAgent, 'id'>>,
) => {
  if (operation.type === 'delete') {
    return operation.deletedRecordId;
  }

  if (operation.type === 'create') {
    return operation.createdRecord.id;
  }

  return operation.updatedRecord.id;
};

type CoreAgentMetadataEventsEffectProps = {
  agentId?: string;
};

export const CoreAgentMetadataEventsEffect = ({
  agentId,
}: CoreAgentMetadataEventsEffectProps) => {
  const apolloClient = useApolloClient();

  const refreshAgents = () => {
    void apolloClient
      .refetchQueries({
        include: [
          isDefined(agentId) ? FindOneAgentDocument : FindManyAgentsDocument,
        ],
        onQueryUpdated: (query) =>
          query.options.fetchPolicy !== 'standby' &&
          (!isDefined(agentId) || query.variables.id === agentId),
      })
      .catch(logError);
  };

  useListenToMetadataOperationBrowserEvent<Pick<CoreAgent, 'id'>>({
    metadataName: 'agent',
    onMetadataOperationBrowserEvent: ({ operation }) => {
      const affectedAgentId = getAffectedAgentId(operation);

      if (isDefined(agentId) && affectedAgentId !== agentId) {
        return;
      }

      refreshAgents();
    },
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refreshAgents,
  });

  return null;
};
