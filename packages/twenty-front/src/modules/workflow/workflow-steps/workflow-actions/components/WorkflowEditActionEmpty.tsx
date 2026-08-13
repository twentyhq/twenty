import { SidePanelWorkflowSelectAction } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { SidePanelWorkflowEditStepType } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepType';
import {
  type WorkflowAction,
  type WorkflowEmptyAction,
} from '@/workflow/types/Workflow';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { isEmptyStepDeletable } from '@/workflow/workflow-steps/utils/isEmptyStepDeletable';

type WorkflowEditActionEmptyProps = {
  action: WorkflowEmptyAction;
  steps?: WorkflowAction[] | null;
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
  action,
  steps,
  actionOptions,
}: WorkflowEditActionEmptyProps) => {
  if (actionOptions.readonly === true) {
    return <SidePanelWorkflowSelectAction onActionSelected={() => {}} />;
  }

  return (
    <>
      <SidePanelWorkflowEditStepType />
      {isEmptyStepDeletable({ stepId: action.id, steps: steps ?? null }) && (
        <WorkflowStepFooter stepId={action.id} shouldHideOptionsDropdown />
      )}
    </>
  );
};
