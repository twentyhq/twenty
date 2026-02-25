import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useAtomComponentStateValue(
    commandMenuWorkflowVersionIdComponentState,
  );
  if (!isDefined(workflowVersionId)) {
    throw new Error(
      'Expected commandMenuWorkflowVersionIdComponentState to be defined',
    );
  }

  return workflowVersionId;
};
