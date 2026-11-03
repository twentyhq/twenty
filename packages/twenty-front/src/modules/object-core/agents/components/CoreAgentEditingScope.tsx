import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreAgentMainEditScopeEffect } from '@/object-core/agents/components/CoreAgentMainEditScopeEffect';
import {
  RoutedFlowStateScopeContext,
  useRoutedFlowStateScopeId,
} from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type CoreAgentEditingScopeProps = { agentId: string; children: ReactNode };

export const CoreAgentEditingScope = ({
  agentId,
  children,
}: CoreAgentEditingScopeProps) => {
  const inheritedScopeId = useRoutedFlowStateScopeId();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentUser = useAtomStateValue(currentUserState);
  const [instanceId] = useState(() => v4());
  const scopeId =
    inheritedScopeId ??
    JSON.stringify({
      agentId,
      workspaceId: currentWorkspace?.id,
      userId: currentUser?.id,
      instanceId,
    });

  return (
    <RoutedFlowStateScopeContext.Provider value={scopeId}>
      {!isDefined(inheritedScopeId) && (
        <CoreAgentMainEditScopeEffect
          agentId={agentId}
          workspaceId={currentWorkspace?.id}
          userId={currentUser?.id}
          scopeId={scopeId}
        />
      )}
      {children}
    </RoutedFlowStateScopeContext.Provider>
  );
};
