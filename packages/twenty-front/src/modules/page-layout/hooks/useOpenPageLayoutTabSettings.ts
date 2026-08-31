import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const useOpenPageLayoutTabSettings = (
  pageLayoutIdFromProps?: string,
) => {
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutIdFromProps,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const openTabSettings = useCallback(
    (tabId: string) => {
      setPageLayoutTabSettingsOpenTabId(tabId);
      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
    },
    [setPageLayoutTabSettingsOpenTabId, navigatePageLayoutSidePanel],
  );

  return { openTabSettings };
};
