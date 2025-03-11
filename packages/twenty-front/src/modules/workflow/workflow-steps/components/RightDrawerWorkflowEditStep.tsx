import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { RightDrawerWorkflowEditStepContent } from '@/workflow/workflow-steps/components/RightDrawerWorkflowEditStepContent';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const RightDrawerWorkflowEditStep = () => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return (
    <WorkflowStepContextProvider
      value={{ workflowVersionId: workflow.currentVersion.id }}
    >
      <RightDrawerWorkflowEditStepContent workflow={workflow} />
    </WorkflowStepContextProvider>
  );
};
