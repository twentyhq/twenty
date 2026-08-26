import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const useOpenPageLayoutTabSettings = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
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
