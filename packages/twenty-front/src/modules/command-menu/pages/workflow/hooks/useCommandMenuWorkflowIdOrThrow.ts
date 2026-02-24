import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowIdOrThrow = () => {
  const workflowId = useAtomComponentValue(commandMenuWorkflowIdComponentState);
  if (!isDefined(workflowId)) {
    throw new Error(
      'Expected commandMenuWorkflowIdComponentState to be defined',
    );
  }

  return workflowId;
};
