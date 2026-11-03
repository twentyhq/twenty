import { CoreAgentTriggerPanel } from '@/object-core/agents/components/CoreAgentTriggerPanel';
import { coreAgentTriggerTargetComponentState } from '@/object-core/agents/states/coreAgentTriggerTargetComponentState';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelCoreAgentTriggerPage = () => {
  const coreAgentTriggerTarget = useAtomComponentStateValue(
    coreAgentTriggerTargetComponentState,
  );

  if (!isDefined(coreAgentTriggerTarget)) {
    return null;
  }

  return (
    <RoutedFlowStateScopeContext.Provider
      value={coreAgentTriggerTarget.scopeId}
    >
      <CoreAgentTriggerPanel
        agentId={coreAgentTriggerTarget.agentId}
        triggerId={coreAgentTriggerTarget.triggerId}
      />
    </RoutedFlowStateScopeContext.Provider>
  );
};
