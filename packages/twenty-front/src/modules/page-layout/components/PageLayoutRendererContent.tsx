import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { PageLayoutMainContent } from '@/page-layout/PageLayoutMainContent';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getScrollWrapperInstanceIdFromPageLayoutId } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { getTabsWithVisibleWidgets } from '@/page-layout/utils/getTabsWithVisibleWidgets';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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

const StyledPageLayoutTabListContainer = styled.div`
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledScrollWrapperContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const { isInSidePanel, layoutType, targetRecordIdentifier } =
    useLayoutRenderingContext();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);
  const { reorderTabs } = useReorderPageLayoutTabs(currentPageLayout?.id ?? '');
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const isMobile = useIsMobile();

  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );

  const isSystemObject =
    (metadataStore.current as ObjectMetadataItem[]).find(
      (item) =>
        item.nameSingular === targetRecordIdentifier?.targetObjectNameSingular,
    )?.isSystem ?? false;

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const handleAddTab =
    isPageLayoutInEditMode &&
    shouldEnableTabEditingFeatures(currentPageLayout.type)
      ? () => {
          const newTabId = createPageLayoutTab(t`Untitled`);
          setPageLayoutTabSettingsOpenTabId(newTabId);
          navigatePageLayoutSidePanel({
            sidePanelPage: SidePanelPages.PageLayoutTabSettings,
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

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId: currentPageLayout.id,
    layoutType,
    targetRecordIdentifier,
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
          <StyledPageLayoutTabListContainer>
            <PageLayoutTabList
              tabs={sortedTabs}
              behaveAsLinks={!isInSidePanel && !isPageLayoutInEditMode}
              componentInstanceId={tabListInstanceId}
              onAddTab={handleAddTab}
              isReorderEnabled={canEnableTabEditing}
              onReorder={canEnableTabEditing ? reorderTabs : undefined}
              pageLayoutType={currentPageLayout.type}
            />
          </StyledPageLayoutTabListContainer>
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
