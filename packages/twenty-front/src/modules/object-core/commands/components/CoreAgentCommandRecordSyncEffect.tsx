import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { useReconcileCoreAgentEditSession } from '@/object-core/agents/hooks/useReconcileCoreAgentEditSession';
import { useQuery } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const CoreAgentCommandRecordSyncEffect = ({
  agentId,
}: {
  agentId: string;
}) => {
  const store = useStore();
  const { sessionAtom } = useCoreAgentEditScope(agentId);
  const { reconcileAgent } = useReconcileCoreAgentEditSession({ agentId });
  const { data } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId },
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    if (!isDefined(data)) {
      return;
    }
    const agent = data.findOneAgent;
    if (!isDefined(agent)) {
      store.set(sessionAtom, undefined);
      return;
    }
    if (agent.id === agentId) {
      reconcileAgent(agent);
    }
  }, [agentId, data, reconcileAgent, sessionAtom, store]);
  return null;
};
