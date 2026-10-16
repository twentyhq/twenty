import { sidePanelWorkflowRunIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowRunIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useSidePanelWorkflowRunIdOrThrow = () => {
  const sidePanelWorkflowRunId = useAtomComponentStateValue(
    sidePanelWorkflowRunIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowRunId)) {
    throw new Error(
      doNotTranslate(
        'Expected the sidePanelWorkflowRunIdComponentState to be defined.',
      ),
    );
  }

  return sidePanelWorkflowRunId;
};
