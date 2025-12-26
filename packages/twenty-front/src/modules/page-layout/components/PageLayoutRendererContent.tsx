import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabHeader } from '@/page-layout/components/PageLayoutTabHeader';
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
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
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

  const { isInRightDrawer } = useLayoutRenderingContext();

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

  const handleAddTab = isPageLayoutInEditMode
    ? () => {
        const newTabId = createPageLayoutTab(t`Untitled`);
        setTabSettingsOpenTabId(newTabId);
        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutTabSettings,
          focusTitleInput: true,
        });
      }
    : undefined;

  const isMobile = useIsMobile();

  if (!isDefined(currentPageLayout)) {
    return null;
  }

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

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(
    currentPageLayout.id,
  );

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
          defaultTabIdToFocusOnMobileAndSidePanel={
            currentPageLayout.defaultTabIdToFocusOnMobileAndSidePanel
          }
        />
        {(sortedTabs.length > 1 || isPageLayoutInEditMode) && (
          <StyledPageLayoutTabList
            tabs={sortedTabs}
            behaveAsLinks={!isInRightDrawer && !isPageLayoutInEditMode}
            componentInstanceId={tabListInstanceId}
            onAddTab={handleAddTab}
            isReorderEnabled={isPageLayoutInEditMode}
            onReorder={isPageLayoutInEditMode ? reorderTabs : undefined}
          />
        )}

        <PageLayoutTabHeader />

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
