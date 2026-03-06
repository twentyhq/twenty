import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'side-panel/workflow-id',
  defaultValue: undefined,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
