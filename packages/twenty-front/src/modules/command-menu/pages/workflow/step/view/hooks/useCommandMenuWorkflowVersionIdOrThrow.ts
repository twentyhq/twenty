import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useAtomComponentValue(
    commandMenuWorkflowVersionIdComponentState,
  );
  if (!isDefined(workflowVersionId)) {
    throw new Error(
      'Expected commandMenuWorkflowVersionIdComponentState to be defined',
    );
  }

  return workflowVersionId;
};
