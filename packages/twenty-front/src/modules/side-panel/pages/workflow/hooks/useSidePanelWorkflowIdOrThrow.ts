import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowIdOrThrow = () => {
  const sidePanelWorkflowId = useAtomComponentStateValue(
    sidePanelWorkflowIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowId)) {
    throw new Error('Expected sidePanelWorkflowIdComponentState to be defined');
  }

  return sidePanelWorkflowId;
};
