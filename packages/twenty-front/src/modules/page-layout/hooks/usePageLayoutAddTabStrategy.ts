import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useRecordPageLayoutObjectApplicationId } from '@/page-layout/hooks/useRecordPageLayoutObjectApplicationId';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutAddTabStrategy } from '@/page-layout/types/PageLayoutAddTabStrategy';
import { isReactivatableTab } from '@/page-layout/utils/isReactivatableTab';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { objectApplicationId } = useRecordPageLayoutObjectApplicationId();

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

  const { isInSidePanel } = useLayoutRenderingContext();

  const navigate = useNavigate();

  const onCreate = useCallback(() => {
    const newTabId = createPageLayoutTab(t`Untitled`);

    if (!isInSidePanel) {
      navigate(`#${newTabId}`);
    }

    setPageLayoutTabSettingsOpenTabId(newTabId);
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutTabSettings,
      focusTitleInput: true,
    });
  }, [
    createPageLayoutTab,
    isInSidePanel,
    navigate,
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

  const hasInactiveTabs = currentPageLayout.tabs.some((tab) =>
    isReactivatableTab({ tab, objectApplicationId }),
  );

  const mode =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE && hasInactiveTabs
      ? 'dropdown'
      : 'direct';

  return { mode, onCreate };
};
