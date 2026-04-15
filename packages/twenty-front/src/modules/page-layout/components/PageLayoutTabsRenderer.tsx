import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutAddTabStrategy } from '@/page-layout/hooks/usePageLayoutAddTabStrategy';
import { useReorderRecordPageLayoutTabs } from '@/page-layout/hooks/useReorderRecordPageLayoutTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

const StyledScrollWrapperContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

export const PageLayoutTabsRenderer = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const { isInSidePanel, layoutType, targetRecordIdentifier } =
    useLayoutRenderingContext();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

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

  const { reorderRecordPageTabs } = useReorderRecordPageLayoutTabs(
    currentPageLayout.id,
  );

  const isMobile = useIsMobile();

  const isRecordPageGlobalEditionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_GLOBAL_EDITION_ENABLED,
  );

  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );

  const isSystemObject =
    (metadataStore.current as FlatObjectMetadataItem[]).find(
      (item) =>
        item.nameSingular === targetRecordIdentifier?.targetObjectNameSingular,
    )?.isSystem ?? false;

  const canEnableTabEditing =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(
      currentPageLayout.type,
      isRecordPageGlobalEditionEnabled,
    );

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInSidePanel,
    isEditMode: isPageLayoutInEditMode,
  });

  const SYSTEM_OBJECT_TABS = ['Home', 'Timeline', 'Overview', 'Flow'];

  const tabsForCurrentObject = isSystemObject
    ? tabsWithVisibleWidgets.filter((tab) =>
        SYSTEM_OBJECT_TABS.includes(tab.title),
      )
    : tabsWithVisibleWidgets;

  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    tabs: tabsForCurrentObject,
    pageLayoutType: currentPageLayout.type,
    isMobile,
    isInSidePanel,
  });

  const sortedTabs = sortTabsByPosition(tabsToRenderInTabList);

  const activeTabExistsInCurrentPageLayout = currentPageLayout.tabs.some(
    (tab) => tab.id === activeTabId,
  );

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
          <PageLayoutTabList
            tabs={sortedTabs}
            behaveAsLinks={!isInSidePanel && !isPageLayoutInEditMode}
            isInSidePanel={isInSidePanel}
            componentInstanceId={tabListInstanceId}
            addTabStrategy={addTabStrategy}
            isReorderEnabled={canEnableTabEditing}
            onReorder={
              canEnableTabEditing
                ? (result, provided) =>
                    reorderRecordPageTabs(
                      result,
                      provided,
                      isDefined(pinnedLeftTab),
                    )
                : undefined
            }
            pageLayoutType={currentPageLayout.type}
          />
        )}

        <StyledScrollWrapperContainer>
          <ScrollWrapper
            componentInstanceId={getScrollWrapperInstanceIdFromPageLayoutId(
              currentPageLayout.id,
            )}
            defaultEnableXScroll={false}
          >
            {isDefined(activeTabId) && activeTabExistsInCurrentPageLayout && (
              <PageLayoutMainContent tabId={activeTabId} />
            )}
          </ScrollWrapper>
        </StyledScrollWrapperContainer>
      </StyledTabsAndDashboardContainer>
    </StyledContainer>
  );
};
