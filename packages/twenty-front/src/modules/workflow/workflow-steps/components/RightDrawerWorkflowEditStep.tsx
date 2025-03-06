import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
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
    <WorkflowVersionComponentInstanceContext.Provider
      value={{ instanceId: workflow.currentVersion.id }}
    >
      <RightDrawerWorkflowEditStepContent workflow={workflow} />
    </WorkflowVersionComponentInstanceContext.Provider>
  );
};
