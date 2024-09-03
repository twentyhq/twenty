import { RightDrawerWorkflowEditStepContent } from '@/workflow/components/RightDrawerWorkflowEditStepContent';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowEditStep = () => {
  const showPageWorkflowId = useRecoilValue(showPageWorkflowIdState);
  const workflow = useWorkflowWithCurrentVersion(showPageWorkflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowEditStepContent workflow={workflow} />;
};
