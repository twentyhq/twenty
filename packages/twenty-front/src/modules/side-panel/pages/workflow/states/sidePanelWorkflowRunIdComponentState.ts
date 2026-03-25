import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowRunIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'side-panel/workflow-run-id',
  defaultValue: undefined,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
