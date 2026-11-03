import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentMainEditScopeState } from '@/object-core/agents/states/coreAgentMainEditScopeState';
import { useAtomValue } from 'jotai';
import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useParams } from 'react-router-dom';

export const useCoreAgentEditScope = (agentId?: string) => {
  const { agentId: routedAgentId = '' } = useParams<{ agentId: string }>();
  const inheritedScopeId = useRoutedFlowStateScopeId();
  const mainEditScope = useAtomValue(coreAgentMainEditScopeState.atom);
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const user = useAtomValue(currentUserState.atom);
  const sessionAgentId = agentId ?? routedAgentId;
  const hasMatchingMainScope =
    mainEditScope?.agentId === sessionAgentId &&
    mainEditScope.workspaceId === workspace?.id &&
    mainEditScope.userId === user?.id;
  const scopeId =
    inheritedScopeId ?? (hasMatchingMainScope ? mainEditScope.scopeId : null);

  return {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom: coreAgentEditSessionFamilyState.getAtom(
      sessionAgentId,
      scopeId,
    ),
  };
};
