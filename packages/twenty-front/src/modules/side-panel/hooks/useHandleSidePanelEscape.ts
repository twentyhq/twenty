import { COMMAND_MENU_SIDE_PANEL_PAGES } from '@/side-panel/constants/CommandMenuSidePanelPages';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelPageSelector } from '@/side-panel/states/sidePanelPageSelector';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';

export const useHandleSidePanelEscape = () => {
  const [sidePanelSearch, setSidePanelSearch] =
    useAtomState(sidePanelSearchState);
  const sidePanelPage = useAtomStateValue(sidePanelPageSelector);

  const { goBackOneSubPageOrMainPage } = useSidePanelHistory();

  return () => {
    const canClearSidePanelSearch =
      COMMAND_MENU_SIDE_PANEL_PAGES.includes(sidePanelPage) &&
      isNonEmptyString(sidePanelSearch);

    if (canClearSidePanelSearch) {
      setSidePanelSearch('');
      return;
    }

    goBackOneSubPageOrMainPage();
  };
};
