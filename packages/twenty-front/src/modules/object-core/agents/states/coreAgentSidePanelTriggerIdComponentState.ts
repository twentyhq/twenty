import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const coreAgentSidePanelTriggerIdComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/core-agent-trigger-id',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
