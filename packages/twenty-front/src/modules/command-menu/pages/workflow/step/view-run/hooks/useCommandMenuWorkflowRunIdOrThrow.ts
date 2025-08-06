import { commandMenuWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowRunIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowRunIdOrThrow = () => {
  const workflowRunId = useRecoilComponentValue(
    commandMenuWorkflowRunIdComponentState,
  );
  if (!isDefined(workflowRunId)) {
    throw new Error(
      'Expected the commandMenuWorkflowRunIdComponentState to be defined.',
    );
  }

  return workflowRunId;
};
