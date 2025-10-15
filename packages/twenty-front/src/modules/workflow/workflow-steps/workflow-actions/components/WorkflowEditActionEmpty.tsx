import { CommandMenuWorkflowSelectAction } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectAction';
import { CommandMenuWorkflowEditStepType } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepType';
import { type WorkflowEmptyAction } from '@/workflow/types/Workflow';

type WorkflowEditActionEmptyProps = {
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowEmptyAction) => void;
      };
};

export const WorkflowEditActionEmpty = ({
  actionOptions,
}: WorkflowEditActionEmptyProps) => {
  if (actionOptions.readonly === true) {
    return <CommandMenuWorkflowSelectAction onActionSelected={() => {}} />;
  }

  return <CommandMenuWorkflowEditStepType />;
};
