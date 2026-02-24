import { CommandMenuWorkflowRunStepContentComponentInstanceContext } from '@/command-menu/pages/workflow/step/view-run/states/contexts/CommandMenuWorkflowRunStepContentComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const workflowRunIteratorSubStepIterationIndexComponentState =
  createComponentStateV2<number>({
    key: 'workflowRunIteratorSubStepIterationIndexComponentState',
    defaultValue: 0,
    componentInstanceContext:
      CommandMenuWorkflowRunStepContentComponentInstanceContext,
  });
