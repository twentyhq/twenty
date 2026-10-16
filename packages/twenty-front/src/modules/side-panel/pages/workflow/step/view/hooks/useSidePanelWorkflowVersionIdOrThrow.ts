import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useSidePanelWorkflowVersionIdOrThrow = () => {
  const sidePanelWorkflowVersionId = useAtomComponentStateValue(
    sidePanelWorkflowVersionIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowVersionId)) {
    throw new Error(
      doNotTranslate(
        'Expected sidePanelWorkflowVersionIdComponentState to be defined',
      ),
    );
  }

  return sidePanelWorkflowVersionId;
};
