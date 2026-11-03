import { AppNavigatorContext } from '@/app/contexts/AppNavigatorContext';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreAgentCommandOriginContext } from '@/object-core/commands/contexts/CoreAgentCommandOriginContext';
import { type CoreAgentCommandTarget } from '@/object-core/commands/types/CoreAgentCommandTarget';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ReactNode, useContext } from 'react';

type CoreAgentCommandOriginProviderProps = {
  target: CoreAgentCommandTarget;
  children: ReactNode;
};

export const CoreAgentCommandOriginProvider = ({
  target,
  children,
}: CoreAgentCommandOriginProviderProps) => {
  const navigator = useContext(AppNavigatorContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUser = useAtomStateValue(currentUserState);
  const scopeId = useRoutedFlowStateScopeId();
  const surface = useWorkspaceSurface();
  return (
    <CoreAgentCommandOriginContext.Provider
      value={{
        target,
        navigator,
        scopeId,
        surfaceType: surface.type,
        workspaceId: currentWorkspace?.id,
        userId: currentUser?.id,
      }}
    >
      {children}
    </CoreAgentCommandOriginContext.Provider>
  );
};
