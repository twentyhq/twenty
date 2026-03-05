import { sidePanelWorkflowRunIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowRunIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowRunIdOrThrow = () => {
  const sidePanelWorkflowRunId = useAtomComponentStateValue(
    sidePanelWorkflowRunIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowRunId)) {
    throw new Error(
      'Expected the sidePanelWorkflowRunIdComponentState to be defined.',
    );
  }

  return sidePanelWorkflowRunId;
};
