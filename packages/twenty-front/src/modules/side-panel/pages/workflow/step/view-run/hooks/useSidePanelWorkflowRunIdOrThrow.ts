import { sidePanelWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/sidePanelWorkflowRunIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowRunIdOrThrow = () => {
  const commandMenuWorkflowRunId = useAtomComponentStateValue(
    sidePanelWorkflowRunIdComponentState,
  );
  if (!isDefined(commandMenuWorkflowRunId)) {
    throw new Error(
      'Expected the sidePanelWorkflowRunIdComponentState to be defined.',
    );
  }

  return commandMenuWorkflowRunId;
};
