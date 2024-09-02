import { useFindWorkflowWithCurrentVersion } from '@/workflow/hooks/useFindWorkflowWithCurrentVersion';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { useRecoilValue } from 'recoil';

export const useFindShowPageWorkflow = () => {
  const showPageWorkflowId = useRecoilValue(showPageWorkflowIdState);

  return useFindWorkflowWithCurrentVersion(showPageWorkflowId);
};
