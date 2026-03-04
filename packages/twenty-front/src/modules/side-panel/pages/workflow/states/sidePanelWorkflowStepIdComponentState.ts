import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowStepIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'command-menu/workflow-step-id',
  defaultValue: undefined,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
