import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowIdOrThrow = () => {
  const workflowId = useRecoilComponentValueV2(
    commandMenuWorkflowIdComponentState,
  );
  if (!isDefined(workflowId)) {
    throw new Error(
      'Expected commandMenuWorkflowIdComponentState to be defined',
    );
  }

  return workflowId;
};
