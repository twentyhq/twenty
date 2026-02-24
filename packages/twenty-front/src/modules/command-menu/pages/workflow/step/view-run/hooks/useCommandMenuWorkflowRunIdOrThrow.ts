import { commandMenuWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowRunIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowRunIdOrThrow = () => {
  const workflowRunId = useAtomComponentValue(
    commandMenuWorkflowRunIdComponentState,
  );
  if (!isDefined(workflowRunId)) {
    throw new Error(
      'Expected the commandMenuWorkflowRunIdComponentState to be defined.',
    );
  }

  return workflowRunId;
};
