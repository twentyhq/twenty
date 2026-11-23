import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTriggerSettings } from '@/object-core/agents/components/CoreAgentTriggerSettings';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';
import { coreAgentSidePanelTriggerIdComponentState } from '@/object-core/agents/states/coreAgentSidePanelTriggerIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const SidePanelCoreAgentTriggerPage = () => {
  const { agent } = useCoreAgentSidePanelAgent();
  const coreAgentSidePanelTriggerId = useAtomComponentStateValue(
    coreAgentSidePanelTriggerIdComponentState,
  );

  if (!isDefined(agent) || !isNonEmptyString(coreAgentSidePanelTriggerId)) {
    return null;
  }

  return (
    <CoreAgentTriggerSettings
      agent={agent}
      triggerId={coreAgentSidePanelTriggerId}
    />
  );
};
