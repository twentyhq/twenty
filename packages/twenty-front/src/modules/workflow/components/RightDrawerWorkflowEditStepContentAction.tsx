import { WorkflowAction } from '@/workflow/types/Workflow';

export const RightDrawerWorkflowEditStepContentAction = ({
  action,
}: {
  action: WorkflowAction;
}) => {
  return <p>{action.name}</p>;
};
