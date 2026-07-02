import { useCallback } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
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

  const handleSidePanelEscape = useCallback(() => {
    if (isNonEmptyString(sidePanelSearch)) {
      setSidePanelSearch('');
      return;
    }

    goBackOneSubPageOrMainPage();
  }, [goBackOneSubPageOrMainPage, setSidePanelSearch, sidePanelSearch]);

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
