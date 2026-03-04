import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowIdOrThrow = () => {
  const commandMenuWorkflowId = useAtomComponentStateValue(
    commandMenuWorkflowIdComponentState,
  );
  if (!isDefined(commandMenuWorkflowId)) {
    throw new Error(
      'Expected commandMenuWorkflowIdComponentState to be defined',
    );
  }

  return commandMenuWorkflowId;
};
