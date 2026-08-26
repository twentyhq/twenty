import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import {
  PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME,
  PageLayoutRecordIdentifierBar,
} from '@/page-layout/components/PageLayoutRecordIdentifierBar';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutAddTabStrategy } from '@/page-layout/hooks/usePageLayoutAddTabStrategy';
import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;

  @media print {
    display: block;
    height: auto;
  }
`;

const StyledContainer = styled.div<{ hasPinnedTab: boolean }>`
  display: grid;
  flex: 1;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px 1fr` : '1fr'};
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  width: 100%;

  @media print {
    display: block;
    height: auto;
    width: 100%;
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

  const isMobile = useIsMobile();

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

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

  const shouldRenderRecordIdentifierBar =
    currentPageLayout.type === PageLayoutType.RECORD_PAGE &&
    isDefined(targetRecordIdentifier) &&
    !isInSidePanel &&
    !isMobile;

  const tabList = (sortedTabs.length > 1 || isPageLayoutInEditMode) && (
    <PageLayoutTabList
      className={
        shouldRenderRecordIdentifierBar
          ? PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME
          : 'page-layout-tab-list-print-hidden'
      }
      tabs={sortedTabs}
      behaveAsLinks={!isInSidePanel && !isPageLayoutInEditMode}
      isInSidePanel={isInSidePanel}
      componentInstanceId={tabListInstanceId}
      addTabStrategy={addTabStrategy}
      isReorderEnabled={canEnableTabEditing}
      pageLayoutType={currentPageLayout.type}
    />
  );

  return (
    <PageLayoutWidgetDndProvider>
      <StyledRoot>
        {shouldRenderRecordIdentifierBar && (
          <PageLayoutRecordIdentifierBar
            targetRecordIdentifier={targetRecordIdentifier}
            hasPinnedTab={isDefined(pinnedLeftTab)}
            pinnedTabToEdit={isPageLayoutInEditMode ? pinnedLeftTab : undefined}
            tabList={tabList}
          />
        )}

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
            {!shouldRenderRecordIdentifierBar && tabList}

            <StyledScrollWrapperContainer>
              <ScrollWrapper
                className="page-layout-scroll-wrapper"
                componentInstanceId={getScrollWrapperInstanceIdFromPageLayoutId(
                  currentPageLayout.id,
                )}
                defaultEnableXScroll={false}
              >
                {isDefined(activeTabId) && activeTabExistsInRenderableTabs && (
                  <PageLayoutMainContent tabId={activeTabId} />
                )}
              </ScrollWrapper>
            </StyledScrollWrapperContainer>
          </StyledTabsAndDashboardContainer>
        </StyledContainer>
      </StyledRoot>
    </PageLayoutWidgetDndProvider>
  );
};
