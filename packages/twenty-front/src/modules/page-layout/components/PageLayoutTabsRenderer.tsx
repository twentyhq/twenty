import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutPrerenderedTabIdsResetEffect } from '@/page-layout/components/PageLayoutPrerenderedTabIdsResetEffect';
import { PageLayoutScrollResetEffect } from '@/page-layout/components/PageLayoutScrollResetEffect';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutAddTabStrategy } from '@/page-layout/hooks/usePageLayoutAddTabStrategy';
import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { pageLayoutPrerenderedTabIdsComponentState } from '@/page-layout/states/pageLayoutPrerenderedTabIdsComponentState';
import { getScrollWrapperInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutAndRecord';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { shouldPrerenderPageLayoutTab } from '@/page-layout/utils/shouldPrerenderPageLayoutTab';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { Activity } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ hasPinnedTab: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px 1fr` : '1fr'};
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
  width: 100%;

  @media print {
    display: block;
    height: auto;
    width: 100%;

    .page-layout-scroll-wrapper {
      container-name: none !important;
      container-type: normal !important;
    }

    .page-layout-viewport-filling-widget-slot {
      --widget-height: auto !important;

      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;

      .widget-card-header {
        position: static !important;
      }
    }
  }
`;

const StyledTabsAndDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media print {
    display: block;
    overflow: visible;

    .page-layout-tab-list-print-hidden {
      display: none;
    }
  }
`;

const StyledScrollWrapperContainer = styled.div`
  flex: 1;
  min-height: 0;

  .page-layout-scroll-wrapper {
    container-name: tab-viewport;
    container-type: size;
  }

  // The mobile navigation bar floats over the page, so the content reserves its
  // footprint to stay readable once scrolled to the end.
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    .page-layout-scroll-wrapper {
      box-sizing: border-box;
      padding-bottom: ${themeCssVariables.spacing[20]};
    }
  }

  @media print {
    min-height: auto;

    .page-layout-scroll-wrapper {
      height: auto;
      overflow: visible;
    }
  }
`;

export const PageLayoutTabsRenderer = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const { isInSidePanel, layoutType, targetRecordIdentifier } =
    useLayoutRenderingContext();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const scrollWrapperInstanceId =
    getScrollWrapperInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: currentPageLayout.id,
      layoutType,
      targetRecordIdentifier,
      isInSidePanel,
      scrollWrapperArea: 'tab-content',
    });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId: currentPageLayout.id,
    layoutType,
    targetRecordIdentifier,
  });

  const addTabStrategy = usePageLayoutAddTabStrategy({
    pageLayoutId: currentPageLayout.id,
    tabListInstanceId,
  });

  const canEnableTabEditing =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type);

  const { tabsToRenderInTabList, pinnedLeftTab } =
    usePageLayoutRenderableTabs();

  const sortedTabs = sortTabsByPosition(tabsToRenderInTabList);

  const activeTabExistsInRenderableTabs = sortedTabs.some(
    (tab) => tab.id === activeTabId,
  );

  const pageLayoutPrerenderedTabIds = useAtomComponentStateValue(
    pageLayoutPrerenderedTabIdsComponentState,
  );

  const tabsToMount = sortedTabs.filter(
    (tab) =>
      tab.id === activeTabId ||
      (!isPageLayoutInEditMode &&
        pageLayoutPrerenderedTabIds.includes(tab.id) &&
        shouldPrerenderPageLayoutTab({
          tab,
          pageLayoutType: currentPageLayout.type,
        })),
  );

  return (
    <PageLayoutWidgetDndProvider>
      <PageLayoutScrollResetEffect
        pageLayoutTabId={activeTabId}
        scrollWrapperInstanceId={scrollWrapperInstanceId}
        targetRecordId={targetRecordIdentifier?.id}
      />
      <PageLayoutPrerenderedTabIdsResetEffect />
      <StyledContainer hasPinnedTab={isDefined(pinnedLeftTab)}>
        {isDefined(pinnedLeftTab) && (
          <PageLayoutLeftPanel
            pageLayoutId={currentPageLayout.id}
            pinnedLeftTabId={pinnedLeftTab.id}
          />
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
            <PageLayoutTabList
              className="page-layout-tab-list-print-hidden"
              tabs={sortedTabs}
              behaveAsLinks={!isInSidePanel && !isPageLayoutInEditMode}
              isInSidePanel={isInSidePanel}
              componentInstanceId={tabListInstanceId}
              addTabStrategy={addTabStrategy}
              isReorderEnabled={canEnableTabEditing}
              pageLayoutType={currentPageLayout.type}
            />
          )}

          <StyledScrollWrapperContainer>
            <ScrollWrapper
              className="page-layout-scroll-wrapper"
              componentInstanceId={scrollWrapperInstanceId}
              defaultEnableXScroll={false}
            >
              {isDefined(activeTabId) &&
                activeTabExistsInRenderableTabs &&
                tabsToMount.map((tab) => (
                  // Prerendering relies on the widgets fetching through
                  // suspense hooks, which start their queries during render:
                  // hidden activities do not mount effects, so effect-started
                  // fetches would never preload (see
                  // pageLayoutTabPrerenderContract.test).
                  <Activity
                    key={tab.id}
                    mode={tab.id === activeTabId ? 'visible' : 'hidden'}
                  >
                    <PageLayoutMainContent tabId={tab.id} />
                  </Activity>
                ))}
            </ScrollWrapper>
          </StyledScrollWrapperContainer>
        </StyledTabsAndDashboardContainer>
      </StyledContainer>
    </PageLayoutWidgetDndProvider>
  );
};
