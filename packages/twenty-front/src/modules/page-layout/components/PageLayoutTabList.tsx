import { useDragDropMonitor } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, useIcons } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/input';

import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PAGE_LAYOUT_TAB_LIST_END_DROP_ZONE_WIDTH } from '@/page-layout/constants/PageLayoutTabListEndDropZoneWidth';
import { PageLayoutTabListNewTabDropdownContent } from '@/page-layout/components/PageLayoutTabListNewTabDropdownContent';
import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import { PageLayoutTabListVisibleTabs } from '@/page-layout/components/PageLayoutTabListVisibleTabs';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutAddTabStrategy } from '@/page-layout/types/PageLayoutAddTabStrategy';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { TabListDropdown } from '@/ui/layout/tab-list/components/TabListDropdown';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${TAB_LIST_HEIGHT};
  padding-left: ${themeCssVariables.spacing[2]};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${themeCssVariables.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledDropdownContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledAddButton = styled.div`
  align-items: center;
  display: flex;
  height: ${TAB_LIST_HEIGHT};
  margin-left: ${TAB_LIST_GAP}px;
`;

type PageLayoutTabListProps = Omit<TabListProps, 'tabs'> & {
  tabs: PageLayoutTab[];
  isReorderEnabled: boolean;
  addTabStrategy?: PageLayoutAddTabStrategy;
  behaveAsLinks: boolean;
  pageLayoutType: PageLayoutType;
};

export const PageLayoutTabList = ({
  tabs,
  loading,
  behaveAsLinks,
  isInSidePanel,
  className,
  componentInstanceId,
  onChangeTab,
  addTabStrategy,
  isReorderEnabled,
  pageLayoutType,
}: PageLayoutTabListProps) => {
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const tabsWithIcons: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id,
    title: tab.title,
    Icon: isDefined(tab.icon) ? getIcon(tab.icon) : undefined,
  }));

  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useAtomComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const {
    visibleTabCount,
    hiddenTabs,
    hiddenTabsCount,
    hasHiddenTabs,
    onTabWidthChange,
    onContainerWidthChange,
    onMoreButtonWidthChange,
    onAddButtonWidthChange,
  } = useTabListMeasurements({
    visibleTabs: tabsWithIcons,
    hasAddButton: isDefined(addTabStrategy),
  });

  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const addTabDropdownId = `tab-add-${componentInstanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();
  const { toggleClickOutside } = useClickOutsideListener(dropdownId);

  const setIsPageLayoutTabDragging = useSetAtomComponentState(
    isPageLayoutTabDraggingComponentState,
    componentInstanceId,
  );

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [hasHiddenTabs, hiddenTabs, activeTabId]);

  const selectTab = useCallback(
    (tabId: string) => {
      if (!isInSidePanel) {
        navigate(`#${tabId}`);
      }
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [isInSidePanel, navigate, setActiveTabId, onChangeTab],
  );

  const selectTabFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
        onChangeTab?.(tabId);
        return;
      }

      selectTab(tabId);
    },
    [behaveAsLinks, selectTab, navigate, onChangeTab],
  );

  const closeOverflowDropdown = useCallback(() => {
    closeDropdown(dropdownId);
  }, [closeDropdown, dropdownId]);

  // The overflow dropdown must survive drops into itself: the dragging flag
  // suppresses its close-on-click-outside while a tab drag is in flight, and a
  // drop on the more button reopens it on the freshly appended tab.
  useDragDropMonitor({
    onDragStart: (event) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;

      if (sourceData?.type !== 'tab') {
        return;
      }

      setIsPageLayoutTabDragging(true);
      toggleClickOutside(false);
    },
    onDragEnd: (event) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;

      if (sourceData?.type !== 'tab') {
        return;
      }

      const target = event.operation.target;
      const targetData = target?.data as PageLayoutWidgetDndData | undefined;
      const targetDroppableId = (
        target?.data as { droppableId?: string } | undefined
      )?.droppableId;

      const droppedInOverflow =
        !event.canceled &&
        (targetDroppableId ===
          PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS ||
          String(target?.id) ===
            `${PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}-end`);

      if (!droppedInOverflow) {
        setIsPageLayoutTabDragging(false);
      }

      toggleClickOutside(true);

      if (!event.canceled && targetData?.type === 'tab-more-button') {
        openDropdown({
          dropdownComponentInstanceIdFromProps: dropdownId,
        });
      }
    },
  });

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const openTabSettings = useCallback(
    (tabId: string) => {
      setPageLayoutTabSettingsOpenTabId(tabId);
      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
    },
    [setPageLayoutTabSettingsOpenTabId, navigatePageLayoutSidePanel],
  );

  const isTabSettingsOpen = isDefined(pageLayoutTabSettingsOpenTabId);

  // The reorderable strip appends an end drop zone the tab measurement does
  // not know about; reserve its width so visible tabs never get clipped.
  const handleContainerWidthChange = useCallback(
    (dimensions: { width: number; height: number }) => {
      onContainerWidthChange(
        isReorderEnabled
          ? {
              ...dimensions,
              width: Math.max(
                dimensions.width - PAGE_LAYOUT_TAB_LIST_END_DROP_ZONE_WIDTH,
                0,
              ),
            }
          : dimensions,
      );
    },
    [onContainerWidthChange, isReorderEnabled],
  );

  const handleSelectTab = useCallback(
    (tabId: string) => {
      const shouldOpenSettings =
        isPageLayoutInEditMode &&
        shouldEnableTabEditingFeatures(pageLayoutType);

      if (shouldOpenSettings && activeTabId === tabId) {
        openTabSettings(tabId);
        return;
      }

      if (shouldOpenSettings && isTabSettingsOpen) {
        openTabSettings(tabId);
      }

      selectTab(tabId);
    },
    [
      isPageLayoutInEditMode,
      pageLayoutType,
      activeTabId,
      isTabSettingsOpen,
      openTabSettings,
      selectTab,
    ],
  );

  const handleSelectTabFromDropdown = useCallback(
    (tabId: string) => {
      const shouldOpenSettings =
        isPageLayoutInEditMode &&
        shouldEnableTabEditingFeatures(pageLayoutType);

      if (shouldOpenSettings && activeTabId === tabId) {
        openTabSettings(tabId);
        closeOverflowDropdown();
        return;
      }

      if (shouldOpenSettings && isTabSettingsOpen) {
        openTabSettings(tabId);
      }

      selectTabFromDropdown(tabId);
    },
    [
      isPageLayoutInEditMode,
      pageLayoutType,
      activeTabId,
      isTabSettingsOpen,
      openTabSettings,
      closeOverflowDropdown,
      selectTabFromDropdown,
    ],
  );

  if (tabsWithIcons.length === 0) {
    return null;
  }

  const canReorderTabs = isReorderEnabled;

  const shouldRenderReorderableDropdown = hasHiddenTabs && canReorderTabs;

  const shouldRenderStaticDropdown = hasHiddenTabs && !canReorderTabs;

  // Record pages accept widget drops on vertical-list tabs (dnd-kit drags);
  // dashboards accept them on grid tabs (react-grid-layout drags bridged by
  // pointer hit-testing).
  const widgetDropTargetTabIds = new Set(
    pageLayoutType === PageLayoutType.RECORD_PAGE
      ? tabs
          .filter(
            (tab) => tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST,
          )
          .map((tab) => tab.id)
      : pageLayoutType === PageLayoutType.DASHBOARD
        ? tabs
            .filter(
              (tab) => tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST,
            )
            .map((tab) => tab.id)
        : [],
  );

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <TabListFromUrlOptionalEffect
        isInSidePanel={!!isInSidePanel}
        tabListIds={tabsWithIcons.map((tab) => tab.id)}
      />

      {tabsWithIcons.length > 1 && (
        <TabListHiddenMeasurements
          visibleTabs={tabsWithIcons}
          activeTabId={activeTabId}
          loading={loading}
          onTabWidthChange={onTabWidthChange}
          onMoreButtonWidthChange={onMoreButtonWidthChange}
          onAddButtonWidthChange={
            addTabStrategy ? onAddButtonWidthChange : undefined
          }
          addButtonMeasurement={
            addTabStrategy ? (
              <StyledAddButton>
                <TabButton
                  id="add-tab"
                  LeftIcon={IconPlus}
                  title={t`New Tab`}
                  disableTestId
                />
              </StyledAddButton>
            ) : undefined
          }
        />
      )}

      <NodeDimension onDimensionChange={handleContainerWidthChange}>
        <StyledContainer className={className}>
          <PageLayoutTabListVisibleTabs
            visibleTabs={tabsWithIcons}
            visibleTabCount={visibleTabCount}
            activeTabId={activeTabId}
            behaveAsLinks={behaveAsLinks}
            loading={loading}
            onChangeTab={onChangeTab}
            onSelectTab={handleSelectTab}
            canReorder={canReorderTabs}
            widgetDropTargetTabIds={widgetDropTargetTabIds}
            firstHiddenTabId={
              hasHiddenTabs ? (hiddenTabs[0]?.id ?? null) : null
            }
          />

          {shouldRenderReorderableDropdown && (
            <StyledDropdownContainer>
              <PageLayoutTabListReorderableOverflowDropdown
                dropdownId={dropdownId}
                hiddenTabs={hiddenTabs}
                hiddenTabsCount={hiddenTabsCount}
                isActiveTabHidden={isActiveTabHidden}
                activeTabId={activeTabId || ''}
                loading={loading}
                onSelect={handleSelectTabFromDropdown}
                visibleTabCount={visibleTabCount}
                onClose={closeOverflowDropdown}
                pageLayoutType={pageLayoutType}
              />
            </StyledDropdownContainer>
          )}

          {shouldRenderStaticDropdown && (
            <StyledDropdownContainer>
              <TabListDropdown
                dropdownId={dropdownId}
                hiddenTabs={hiddenTabs}
                overflow={{
                  hiddenTabsCount,
                  isActiveTabHidden,
                }}
                activeTabId={activeTabId || ''}
                loading={loading}
                onTabSelect={handleSelectTabFromDropdown}
                onClose={closeOverflowDropdown}
              />
            </StyledDropdownContainer>
          )}

          {addTabStrategy?.mode === 'direct' && (
            <StyledAddButton>
              <TabButton
                id="add-tab"
                LeftIcon={IconPlus}
                title={t`New Tab`}
                onClick={() => addTabStrategy.onCreate()}
                disableTestId
              />
            </StyledAddButton>
          )}
          {addTabStrategy?.mode === 'dropdown' && (
            <StyledAddButton>
              <Dropdown
                dropdownId={addTabDropdownId}
                clickableComponent={
                  <TabButton
                    id="add-tab"
                    LeftIcon={IconPlus}
                    title={t`New Tab`}
                    disableTestId
                  />
                }
                dropdownComponents={
                  <PageLayoutTabListNewTabDropdownContent
                    onCreate={addTabStrategy.onCreate}
                    dropdownId={addTabDropdownId}
                  />
                }
                dropdownPlacement="bottom-start"
              />
            </StyledAddButton>
          )}
        </StyledContainer>
      </NodeDimension>
    </TabListComponentInstanceContext.Provider>
  );
};
