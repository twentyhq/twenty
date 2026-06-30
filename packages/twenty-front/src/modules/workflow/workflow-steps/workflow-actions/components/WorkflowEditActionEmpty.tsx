import { SidePanelWorkflowSelectAction } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { SidePanelWorkflowEditStepType } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepType';
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
    return <SidePanelWorkflowSelectAction onActionSelected={() => {}} />;
  }

  return <SidePanelWorkflowEditStepType />;
};
