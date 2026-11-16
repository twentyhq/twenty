import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTriggerTypeList } from '@/object-core/agents/components/CoreAgentTriggerTypeList';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';

export const SidePanelCoreAgentTriggerTypePage = () => {
  const { agent } = useCoreAgentSidePanelAgent();

  return isDefined(agent) ? <CoreAgentTriggerTypeList agent={agent} /> : null;
};
