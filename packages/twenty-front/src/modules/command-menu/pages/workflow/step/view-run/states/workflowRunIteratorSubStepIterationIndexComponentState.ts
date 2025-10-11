import { CommandMenuWorkflowRunStepContentComponentInstanceContext } from '@/command-menu/pages/workflow/step/view-run/states/contexts/CommandMenuWorkflowRunStepContentComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const workflowRunIteratorSubStepIterationIndexComponentState =
  createComponentState<number>({
    key: 'workflowRunIteratorSubStepIterationIndexComponentState',
    defaultValue: 0,
    componentInstanceContext:
      CommandMenuWorkflowRunStepContentComponentInstanceContext,
  });
