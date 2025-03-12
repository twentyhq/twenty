import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useWorkflowRunIdOrThrow = () => {
  const workflowRunId = useRecoilValue(workflowRunIdState);
  if (!isDefined(workflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowRunId;
};
