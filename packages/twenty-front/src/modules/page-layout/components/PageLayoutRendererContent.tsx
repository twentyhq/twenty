import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabHeader } from '@/page-layout/components/PageLayoutTabHeader';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

const StyledTabList = styled(PageLayoutTabList)`
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

  const handleAddTab = isPageLayoutInEditMode ? createPageLayoutTab : undefined;

  const isMobile = useIsMobile();

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    pageLayout: currentPageLayout,
    isMobile,
    isInRightDrawer,
  });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(
    currentPageLayout.id,
  );

  const sortedTabs = [...tabsToRenderInTabList].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <ShowPageContainer>
      {isDefined(pinnedLeftTab) && (
        <PageLayoutLeftPanel pinnedLeftTabId={pinnedLeftTab.id} />
      )}

      <StyledShowPageRightContainer>
        <StyledTabsAndDashboardContainer>
          <StyledTabList
            tabs={sortedTabs}
            behaveAsLinks={false}
            componentInstanceId={tabListInstanceId}
            onAddTab={handleAddTab}
            isReorderEnabled={isPageLayoutInEditMode}
            onReorder={isPageLayoutInEditMode ? reorderTabs : undefined}
          />
          <PageLayoutTabHeader />
          <StyledScrollWrapper
            componentInstanceId={`scroll-wrapper-page-layout-${currentPageLayout.id}`}
            defaultEnableXScroll={false}
          >
            {isDefined(activeTabId) && (
              <PageLayoutContent tabId={activeTabId} />
            )}
          </StyledScrollWrapper>
        </StyledTabsAndDashboardContainer>
      </StyledShowPageRightContainer>
    </ShowPageContainer>
  );
};
