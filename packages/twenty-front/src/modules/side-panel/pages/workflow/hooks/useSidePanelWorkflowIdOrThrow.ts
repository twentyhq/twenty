import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowIdOrThrow = () => {
  const sidePanelWorkflowId = useAtomComponentStateValue(
    sidePanelWorkflowIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowId)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
    throw new Error('Expected sidePanelWorkflowIdComponentState to be defined');
  }

  return sidePanelWorkflowId;
};
