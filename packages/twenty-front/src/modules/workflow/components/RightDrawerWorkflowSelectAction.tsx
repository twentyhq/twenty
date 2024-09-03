import { RightDrawerWorkflowSelectActionContent } from '@/workflow/components/RightDrawerWorkflowSelectActionContent';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowSelectAction = () => {
  const showPageWorkflowId = useRecoilValue(showPageWorkflowIdState);
  const workflow = useWorkflowWithCurrentVersion(showPageWorkflowId);

  if (!isDefined(workflow)) {
    return null;
  }

  return <RightDrawerWorkflowSelectActionContent workflow={workflow} />;
};
