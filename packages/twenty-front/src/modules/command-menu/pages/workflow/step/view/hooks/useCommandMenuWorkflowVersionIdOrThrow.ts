import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useRecoilComponentValueV2(
    commandMenuWorkflowVersionIdComponentState,
  );
  if (!isDefined(workflowVersionId)) {
    throw new Error(
      'Expected commandMenuWorkflowVersionIdComponentState to be defined',
    );
  }

  return workflowVersionId;
};
