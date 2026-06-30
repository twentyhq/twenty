import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { WIDGET_TYPE_TO_RELATION_FIELD_NAME } from '@/page-layout/constants/WidgetTypeToRelationFieldName';
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
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

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

  const { objectMetadataItems } = useObjectMetadataItems();

  const inactiveRelationFieldNames = useMemo(() => {
    if (!isDefined(targetRecordIdentifier)) {
      return new Set<string>();
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.nameSingular === targetRecordIdentifier.targetObjectNameSingular,
    );

    if (!isDefined(objectMetadataItem)) {
      return new Set<string>();
    }

    return new Set(
      objectMetadataItem.fields
        .filter(
          (field) =>
            !field.isActive &&
            (field.type === FieldMetadataType.RELATION ||
              field.type === FieldMetadataType.MORPH_RELATION),
        )
        .map((field) => field.name),
    );
  }, [objectMetadataItems, targetRecordIdentifier]);

  const isMobile = useIsMobile();

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
    shouldEnableTabEditingFeatures(currentPageLayout.type);

  const tabsWithVisibleWidgets = getTabsWithVisibleWidgets({
    tabs: currentPageLayout.tabs,
    isMobile,
    isInSidePanel,
    isEditMode: isPageLayoutInEditMode,
  });

  const SYSTEM_OBJECT_TABS = ['Home', 'Timeline', 'Overview', 'Flow'];

  const isUsingDefaultRecordPageLayout =
    currentPageLayout.id === DEFAULT_RECORD_PAGE_LAYOUT_ID;

  const tabsForCurrentObject =
    isSystemObject && isUsingDefaultRecordPageLayout
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

  const sortedActiveTabs = useMemo(
    () =>
      sortedTabs.filter((tab) => {
        const widgetTypes = tab.widgets.map((widget) => widget.type);
        return !widgetTypes.some((widgetType) => {
          const relationFieldName =
            WIDGET_TYPE_TO_RELATION_FIELD_NAME[widgetType];
          return (
            isDefined(relationFieldName) &&
            inactiveRelationFieldNames.has(relationFieldName)
          );
        });
      }),
    [sortedTabs, inactiveRelationFieldNames],
  );

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
          tabs={sortedActiveTabs}
          componentInstanceId={tabListInstanceId}
          defaultTabToFocusOnMobileAndSidePanelId={
            currentPageLayout.defaultTabToFocusOnMobileAndSidePanelId ??
            undefined
          }
        />
        {(sortedActiveTabs.length > 1 || isPageLayoutInEditMode) && (
          <PageLayoutTabList
            className="page-layout-tab-list-print-hidden"
            tabs={sortedActiveTabs}
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
            className="page-layout-scroll-wrapper"
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
