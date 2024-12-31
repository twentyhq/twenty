import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { RightDrawerWorkflowSelectTriggerTypeContent } from '@/workflow/workflow-trigger/components/RightDrawerWorkflowSelectTriggerTypeContent';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowSelectTriggerType = () => {
  const workflowId = useRecoilValue(workflowIdState);
  const workflow = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectTriggerTypeContent workflow={workflow} />;
};
