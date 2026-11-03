import { coreAgentMainEditScopeState } from '@/object-core/agents/states/coreAgentMainEditScopeState';
import { type CoreAgentMainEditScope } from '@/object-core/agents/types/CoreAgentMainEditScope';
import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
import { useStore } from 'jotai';
import { useEffect } from 'react';

type CoreAgentMainEditScopeEffectProps = CoreAgentMainEditScope;

export const CoreAgentMainEditScopeEffect = ({
  agentId,
  workspaceId,
  userId,
  scopeId,
}: CoreAgentMainEditScopeEffectProps) => {
  const store = useStore();
  useEffect(() => {
    const releaseOwner = routedFlowStateScopeRegistry.retain(scopeId);
    store.set(coreAgentMainEditScopeState.atom, {
      agentId,
      workspaceId,
      userId,
      scopeId,
    });
    return () => {
      if (store.get(coreAgentMainEditScopeState.atom)?.scopeId === scopeId) {
        store.set(coreAgentMainEditScopeState.atom, null);
      }
      routedFlowStateScopeRegistry.release(scopeId);
      releaseOwner();
    };
  }, [agentId, workspaceId, userId, scopeId, store]);
  return null;
};
