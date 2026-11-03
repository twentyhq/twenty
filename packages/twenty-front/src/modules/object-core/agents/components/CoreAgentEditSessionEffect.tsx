import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useReconcileCoreAgentEditSession } from '@/object-core/agents/hooks/useReconcileCoreAgentEditSession';
import { useEffect } from 'react';

export const CoreAgentEditSessionEffect = ({ agent }: { agent: CoreAgent }) => {
  const { reconcileAgent } = useReconcileCoreAgentEditSession({
    agentId: agent.id,
  });

  useEffect(() => {
    reconcileAgent(agent);
  }, [agent, reconcileAgent]);

  return null;
};
