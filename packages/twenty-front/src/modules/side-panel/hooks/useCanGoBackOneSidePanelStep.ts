import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSubPageStackForActiveSidePanelPageSelector } from '@/side-panel/states/sidePanelSubPageStackForActiveSidePanelPageSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';

export const useCanGoBackOneSidePanelStep = () => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const sidePanelSubPageStackForActiveSidePanelPage = useAtomStateValue(
    sidePanelSubPageStackForActiveSidePanelPageSelector,
  );

  return (
    isNonEmptyArray(sidePanelSubPageStackForActiveSidePanelPage) ||
    sidePanelNavigationStack.length > 1
  );
};
