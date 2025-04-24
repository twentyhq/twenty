import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowRunIdComponentState } from '@/workflow/states/workflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowRunId = useRecoilComponentValueV2(workflowRunIdComponentState);

  if (!isDefined(workflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowRunId;
};
