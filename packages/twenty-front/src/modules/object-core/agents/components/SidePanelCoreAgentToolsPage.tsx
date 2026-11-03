import { CoreAgentToolsPanel } from '@/object-core/agents/components/CoreAgentToolsPanel';
import { coreAgentPermissionsTargetComponentState } from '@/object-core/agents/states/coreAgentPermissionsTargetComponentState';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelCoreAgentToolsPage = () => {
  const coreAgentPermissionsTarget = useAtomComponentStateValue(
    coreAgentPermissionsTargetComponentState,
  );

  if (!isDefined(coreAgentPermissionsTarget)) {
    return null;
  }

  return (
    <RoutedFlowStateScopeContext.Provider
      value={coreAgentPermissionsTarget.scopeId}
    >
      <CoreAgentToolsPanel agentId={coreAgentPermissionsTarget.agentId} />
    </RoutedFlowStateScopeContext.Provider>
  );
};
