import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowStepIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'side-panel/workflow-step-id',
  defaultValue: undefined,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
