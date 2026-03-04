import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowVersionIdOrThrow = () => {
  const commandMenuWorkflowVersionId = useAtomComponentStateValue(
    sidePanelWorkflowVersionIdComponentState,
  );
  if (!isDefined(commandMenuWorkflowVersionId)) {
    throw new Error(
      'Expected sidePanelWorkflowVersionIdComponentState to be defined',
    );
  }

  return commandMenuWorkflowVersionId;
};
