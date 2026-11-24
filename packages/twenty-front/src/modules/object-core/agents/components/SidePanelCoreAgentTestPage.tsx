import { isDefined } from 'twenty-shared/utils';

import { CoreAgentTestForm } from '@/object-core/agents/components/CoreAgentTestForm';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';

export const SidePanelCoreAgentTestPage = () => {
  const { agent } = useCoreAgentSidePanelAgent();

  if (!isDefined(agent)) {
    return null;
  }

  return <CoreAgentTestForm agent={agent} />;
};
