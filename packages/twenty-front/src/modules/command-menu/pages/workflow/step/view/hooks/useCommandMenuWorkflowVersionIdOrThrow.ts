import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowVersionIdOrThrow = () => {
  const commandMenuWorkflowVersionId = useAtomComponentStateValue(
    commandMenuWorkflowVersionIdComponentState,
  );
  if (!isDefined(commandMenuWorkflowVersionId)) {
    throw new Error(
      'Expected commandMenuWorkflowVersionIdComponentState to be defined',
    );
  }

  return commandMenuWorkflowVersionId;
};
