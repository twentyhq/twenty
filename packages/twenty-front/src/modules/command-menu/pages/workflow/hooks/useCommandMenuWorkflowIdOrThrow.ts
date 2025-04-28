import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowIdOrThrow = () => {
  const workflowId = useRecoilComponentValueV2(workflowIdComponentState);
  if (!isDefined(workflowId)) {
    throw new Error('Expected workflowIdComponentState to be defined');
  }

  return workflowId;
};
