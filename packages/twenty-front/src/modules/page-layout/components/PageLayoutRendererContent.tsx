import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutPinnedTabPanel } from '@/page-layout/components/PageLayoutPinnedTabPanel';
import { PageLayoutTabHeader } from '@/page-layout/components/PageLayoutTabHeader';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
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
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledTabsAndDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.background.primary};
`;

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  width: 100%;
  overflow: auto;
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
        const newTabId = createPageLayoutTab('Untitled');
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

  const sortedTabs = sortTabsByPosition(currentPageLayout.tabs);

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: sortedTabs,
    isMobile,
    isInRightDrawer,
    isEditMode: isPageLayoutInEditMode,
  });

  const { pinnedTab, otherTabs } = getTabsByDisplayMode({
    tabs: tabsWithVisibleWidgets,
    pageLayoutType: currentPageLayout.type,
  });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(
    currentPageLayout.id,
  );

  const tabsForTabList =
    isMobile || isInRightDrawer ? tabsWithVisibleWidgets : otherTabs;

  const showPinnedTabPanel =
    !isMobile && !isInRightDrawer && isDefined(pinnedTab);

  const showTabList = tabsForTabList.length > 1 || isPageLayoutInEditMode;

  return (
    <ShowPageContainer>
      {showPinnedTabPanel && (
        <PageLayoutPinnedTabPanel pinnedTabId={pinnedTab.id} />
      )}

      <StyledShowPageRightContainer>
        <StyledTabsAndDashboardContainer>
          <PageLayoutTabListEffect
            tabs={tabsForTabList}
            componentInstanceId={tabListInstanceId}
            defaultTabIdToFocusOnMobileAndSidePanel={
              currentPageLayout.defaultTabIdToFocusOnMobileAndSidePanel
            }
          />
          {showTabList && (
            <StyledPageLayoutTabList
              tabs={tabsForTabList}
              behaveAsLinks={false}
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
      </StyledShowPageRightContainer>
    </ShowPageContainer>
  );
};
