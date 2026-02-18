import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledContainer = styled.div<{ hasPinnedTab: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px 1fr` : '1fr'};
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  width: 100%;
`;

const StyledTabsAndDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledPageLayoutTabList = styled(PageLayoutTabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const { isInRightDrawer, layoutType, targetRecordIdentifier } =
    useLayoutRenderingContext();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);
  const { reorderTabs } = useReorderPageLayoutTabs(currentPageLayout?.id ?? '');
  const setTabSettingsOpenTabId = useSetRecoilComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const isMobile = useIsMobile();

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const handleAddTab =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type)
      ? () => {
          const newTabId = createPageLayoutTab(t`Untitled`);
          setTabSettingsOpenTabId(newTabId);
          navigatePageLayoutCommandMenu({
            commandMenuPage: CommandMenuPages.PageLayoutTabSettings,
            focusTitleInput: true,
          });
        }
      : undefined;

  const canEnableTabEditing =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type);

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInRightDrawer,
    isEditMode: isPageLayoutInEditMode,
  });

  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    tabs: tabsWithVisibleWidgets,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInRightDrawer,
  });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId: currentPageLayout.id,
    layoutType,
    targetRecordIdentifier,
  });

  const sortedTabs = sortTabsByPosition(tabsToRenderInTabList);

  return (
    <StyledContainer hasPinnedTab={isDefined(pinnedLeftTab)}>
      {isDefined(pinnedLeftTab) && (
        <PageLayoutLeftPanel pinnedLeftTabId={pinnedLeftTab.id} />
      )}

      <StyledTabsAndDashboardContainer>
        <PageLayoutTabListEffect
          tabs={sortedTabs}
          componentInstanceId={tabListInstanceId}
          defaultTabToFocusOnMobileAndSidePanelId={
            currentPageLayout.defaultTabToFocusOnMobileAndSidePanelId ??
            undefined
          }
        />
        {(sortedTabs.length > 1 || isPageLayoutInEditMode) && (
          <StyledPageLayoutTabList
            tabs={sortedTabs}
            behaveAsLinks={!isInRightDrawer && !isPageLayoutInEditMode}
            componentInstanceId={tabListInstanceId}
            onAddTab={handleAddTab}
            isReorderEnabled={canEnableTabEditing}
            onReorder={canEnableTabEditing ? reorderTabs : undefined}
            pageLayoutType={currentPageLayout.type}
          />
        )}

        <StyledScrollWrapper
          componentInstanceId={getScrollWrapperInstanceIdFromPageLayoutId(
            currentPageLayout.id,
          )}
          defaultEnableXScroll={false}
        >
          {isDefined(activeTabId) && (
            <PageLayoutMainContent tabId={activeTabId} />
          )}
        </StyledScrollWrapper>
      </StyledTabsAndDashboardContainer>
    </StyledContainer>
  );
};
