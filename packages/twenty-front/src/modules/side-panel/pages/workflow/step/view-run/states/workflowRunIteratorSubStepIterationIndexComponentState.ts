import { SidePanelWorkflowRunStepContentComponentInstanceContext } from '@/side-panel/pages/workflow/step/view-run/states/contexts/SidePanelWorkflowRunStepContentComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const workflowRunIteratorSubStepIterationIndexComponentState =
  createAtomComponentState<number>({
    key: 'workflowRunIteratorSubStepIterationIndexComponentState',
    defaultValue: 0,
    componentInstanceContext:
      SidePanelWorkflowRunStepContentComponentInstanceContext,
  });
