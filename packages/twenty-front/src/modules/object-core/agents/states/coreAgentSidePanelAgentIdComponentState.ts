import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const coreAgentSidePanelAgentIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/core-agent-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
