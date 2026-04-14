import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutAddTabStrategy } from '@/page-layout/types/PageLayoutAddTabStrategy';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';

export const usePageLayoutAddTabStrategy = ({
  pageLayoutId,
  tabListInstanceId,
}: {
  pageLayoutId: string;
  tabListInstanceId: string;
}): PageLayoutAddTabStrategy | undefined => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const isRecordPageGlobalEditionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  );

  const { createPageLayoutTab } = useCreatePageLayoutTab({
    pageLayoutId,
    tabListInstanceId,
  });

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const onCreate = useCallback(() => {
    const newTabId = createPageLayoutTab(t`Untitled`);
    setPageLayoutTabSettingsOpenTabId(newTabId);
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutTabSettings,
      focusTitleInput: true,
    });
  }, [
    createPageLayoutTab,
    setPageLayoutTabSettingsOpenTabId,
    navigatePageLayoutSidePanel,
  ]);

  const isEnabled =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(
      currentPageLayout.type,
      isRecordPageGlobalEditionEnabled,
    );

  if (!isEnabled) {
    return undefined;
  }

  const mode =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE
      ? 'dropdown'
      : 'direct';

  return { mode, onCreate };
};
