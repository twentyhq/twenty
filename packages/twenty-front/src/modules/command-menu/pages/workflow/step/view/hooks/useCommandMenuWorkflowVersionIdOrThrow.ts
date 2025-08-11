import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useRecoilComponentValue(
    commandMenuWorkflowVersionIdComponentState,
  );
  if (!isDefined(workflowVersionId)) {
    throw new Error(
      'Expected commandMenuWorkflowVersionIdComponentState to be defined',
    );
  }

  return workflowVersionId;
};
