import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowIdOrThrow = () => {
  const workflowId = useAtomComponentStateValue(
    commandMenuWorkflowIdComponentState,
  );
  if (!isDefined(workflowId)) {
    throw new Error(
      'Expected commandMenuWorkflowIdComponentState to be defined',
    );
  }

  return workflowId;
};
