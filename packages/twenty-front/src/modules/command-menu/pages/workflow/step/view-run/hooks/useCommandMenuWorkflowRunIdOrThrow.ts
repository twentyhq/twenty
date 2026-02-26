import { commandMenuWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowRunIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowRunIdOrThrow = () => {
  const commandMenuWorkflowRunId = useAtomComponentStateValue(
    commandMenuWorkflowRunIdComponentState,
  );
  if (!isDefined(commandMenuWorkflowRunId)) {
    throw new Error(
      'Expected the commandMenuWorkflowRunIdComponentState to be defined.',
    );
  }

  return commandMenuWorkflowRunId;
};
