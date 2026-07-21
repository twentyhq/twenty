import { useCanGoBackOneSidePanelStep } from '@/side-panel/hooks/useCanGoBackOneSidePanelStep';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';

export const useHandleSidePanelBackspace = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const canGoBackOneSidePanelStep = useCanGoBackOneSidePanelStep();

  const { goBackOneSubPageOrMainPage } = useSidePanelHistory();

  return () => {
    if (!canGoBackOneSidePanelStep || isNonEmptyString(sidePanelSearch)) {
      return false;
    }

    goBackOneSubPageOrMainPage();

    return true;
  };
};
