import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { RightDrawerWorkflowSelectActionContent } from '@/workflow/workflow-steps/workflow-actions/components/RightDrawerWorkflowSelectActionContent';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowSelectAction = () => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectActionContent workflow={workflow} />;
};
