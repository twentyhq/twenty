import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const coreAgentTriggerTargetComponentState = createAtomComponentState<{
  agentId: string;
  triggerId: string;
  scopeId: string | null;
} | null>({
  key: 'core-agent-trigger-target',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
