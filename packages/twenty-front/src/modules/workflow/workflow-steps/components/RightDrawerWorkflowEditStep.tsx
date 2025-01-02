import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { RightDrawerWorkflowEditStepContent } from '@/workflow/workflow-steps/components/RightDrawerWorkflowEditStepContent';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowEditStep = () => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowEditStepContent workflow={workflow} />;
};
