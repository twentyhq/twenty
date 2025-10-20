import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
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

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const targetRecordIdentifier = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);

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

  return (
    <ShowPageContainer>
      {isDefined(pinnedLeftTab) && (
        <ShowPageLeftContainer>
          <SummaryCard
            objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
            objectRecordId={targetRecordIdentifier.id}
            isInRightDrawer={isInRightDrawer}
          />

          <PageLayoutGridLayout tabId={pinnedLeftTab.id} />
        </ShowPageLeftContainer>
      )}

      <StyledShowPageRightContainer>
        <StyledTabsAndDashboardContainer>
          <StyledTabList
            tabs={tabsToRenderInTabList}
            behaveAsLinks={false}
            componentInstanceId={getTabListInstanceIdFromPageLayoutId(
              currentPageLayout.id,
            )}
            onAddTab={handleAddTab}
          />
          <StyledScrollWrapper
            componentInstanceId={`scroll-wrapper-page-layout-${currentPageLayout.id}`}
            defaultEnableXScroll={false}
          >
            {isDefined(activeTabId) && (
              <PageLayoutGridLayout tabId={activeTabId} />
            )}
          </StyledScrollWrapper>
        </StyledTabsAndDashboardContainer>
      </StyledShowPageRightContainer>
    </ShowPageContainer>
  );
};
