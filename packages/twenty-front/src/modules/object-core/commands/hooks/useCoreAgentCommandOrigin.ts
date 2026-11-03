import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentCommandOriginFamilyState } from '@/object-core/commands/states/coreAgentCommandOriginFamilyState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomValue } from 'jotai';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCoreAgentCommandOrigin = () => {
  const page = useContext(SidePanelPageComponentInstanceContext);
  const pageId = page?.instanceId ?? '';
  const scopeId = useRoutedFlowStateScopeId();
  const origin = useAtomValue(
    coreAgentCommandOriginFamilyState.getAtom(pageId, scopeId),
  );
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const user = useAtomValue(currentUserState.atom);
  const isCurrentActor =
    isDefined(workspace) &&
    isDefined(user) &&
    origin?.workspaceId === workspace.id &&
    origin.userId === user.id;
  return { origin: isCurrentActor ? origin : null, pageId };
};
