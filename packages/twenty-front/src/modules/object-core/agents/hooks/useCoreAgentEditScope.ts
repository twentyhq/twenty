import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useParams } from 'react-router-dom';

export const useCoreAgentEditScope = (agentId?: string) => {
  const { agentId: routedAgentId = '' } = useParams<{ agentId: string }>();
  const scopeId = useRoutedFlowStateScopeId();
  const sessionAgentId = agentId ?? routedAgentId;

  return {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom: coreAgentEditSessionFamilyState.getAtom(
      sessionAgentId,
      scopeId,
    ),
  };
};
