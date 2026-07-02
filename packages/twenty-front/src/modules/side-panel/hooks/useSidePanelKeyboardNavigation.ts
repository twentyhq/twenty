import { useCallback } from 'react';

import { COMMAND_MENU_SIDE_PANEL_PAGES } from '@/side-panel/constants/CommandMenuSidePanelPages';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomValue } from 'jotai';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

export const useSidePanelKeyboardNavigation = () => {
  const [sidePanelSearch, setSidePanelSearch] =
    useAtomState(sidePanelSearchState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);
  const sidePanelPageInstanceId = isNonEmptyString(sidePanelPageInfo.instanceId)
    ? sidePanelPageInfo.instanceId
    : SIDE_PANEL_COMPONENT_INSTANCE_ID;
  const sidePanelSubPageStack = useAtomValue(
    sidePanelSubPageStackComponentState.atomFamily({
      instanceId: sidePanelPageInstanceId,
    }),
  );

  const { goBackOneSubPageOrMainPage } = useSidePanelHistory();

  const canGoBackOneSidePanelStep =
    isNonEmptyArray(sidePanelSubPageStack) ||
    sidePanelNavigationStack.length > 1;

  const canClearSidePanelSearch =
    COMMAND_MENU_SIDE_PANEL_PAGES.includes(sidePanelPage) &&
    isNonEmptyString(sidePanelSearch);

  const handleSidePanelEscape = useCallback(() => {
    if (canClearSidePanelSearch) {
      setSidePanelSearch('');
      return;
    }

    goBackOneSubPageOrMainPage();
  }, [canClearSidePanelSearch, goBackOneSubPageOrMainPage, setSidePanelSearch]);

  const handleSidePanelBackspace = useCallback(() => {
    if (!canGoBackOneSidePanelStep || isNonEmptyString(sidePanelSearch)) {
      return;
    }

    goBackOneSubPageOrMainPage();
  }, [canGoBackOneSidePanelStep, goBackOneSubPageOrMainPage, sidePanelSearch]);

  return {
    canGoBackOneSidePanelStep,
    handleSidePanelBackspace,
    handleSidePanelEscape,
  };
};
