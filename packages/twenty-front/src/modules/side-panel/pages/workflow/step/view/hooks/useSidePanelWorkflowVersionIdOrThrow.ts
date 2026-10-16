import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowVersionIdOrThrow = () => {
  const sidePanelWorkflowVersionId = useAtomComponentStateValue(
    sidePanelWorkflowVersionIdComponentState,
  );
  if (!isDefined(sidePanelWorkflowVersionId)) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      'Expected sidePanelWorkflowVersionIdComponentState to be defined',
    );
  }

  return sidePanelWorkflowVersionId;
};
