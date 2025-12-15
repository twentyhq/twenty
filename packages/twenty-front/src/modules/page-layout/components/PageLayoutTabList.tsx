import styled from '@emotion/styled';
import {
  DragDropContext,
  type DropResult,
  type OnDragEndResponder,
  type OnDragStartResponder,
  type OnDragUpdateResponder,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { TabListHiddenMeasurements } from '@/ui/layout/tab-list/components/TabListHiddenMeasurements';
import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type TabListProps } from '@/ui/layout/tab-list/types/TabListProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import { PageLayoutTabListStaticOverflowDropdown } from '@/page-layout/components/PageLayoutTabListStaticOverflowDropdown';
import { PageLayoutTabListVisibleTabs } from '@/page-layout/components/PageLayoutTabListVisibleTabs';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${({ theme }) => theme.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledAddButton = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing(10)};
  margin-left: ${TAB_LIST_GAP}px;
`;

type PageLayoutTabListProps = Omit<TabListProps, 'tabs'> & {
  tabs: PageLayoutTab[];
  isReorderEnabled: boolean;
  onAddTab?: () => void;
  onReorder?: (result: DropResult, provided: ResponderProvided) => boolean;
  behaveAsLinks: boolean;
};

export const PageLayoutTabList = ({
  tabs,
  loading,
  behaveAsLinks,
  isInRightDrawer,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isReorderEnabled,
  onReorder,
}: PageLayoutTabListProps) => {
  const { getIcon } = useIcons();

  const tabsWithIcons: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id,
    title: tab.title,
    Icon: tab.icon ? getIcon(tab.icon) : undefined,
  }));

  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
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
    hasAddButton: isDefined(onAddTab),
  });

  const dropdownId = `tab-overflow-${componentInstanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();
  const { toggleClickOutside } = useClickOutsideListener(dropdownId);

  const setIsTabDragging = useSetRecoilComponentState(
    isPageLayoutTabDraggingComponentState,
    componentInstanceId,
  );

  const isActiveTabHidden = useMemo(() => {
    if (!hasHiddenTabs) return false;
    return hiddenTabs.some((tab) => tab.id === activeTabId);
  }, [hasHiddenTabs, hiddenTabs, activeTabId]);

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [setActiveTabId, onChangeTab],
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

  const setPageLayoutTabListCurrentDragDroppableId = useSetRecoilComponentState(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
  );

  const handleDragUpdate: OnDragUpdateResponder = (update) => {
    setPageLayoutTabListCurrentDragDroppableId(update.destination?.droppableId);
  };

  const handleDragStart = useCallback<OnDragStartResponder>(() => {
    setIsTabDragging(true);
    toggleClickOutside(false);
  }, [setIsTabDragging, toggleClickOutside]);

  const handleDragEnd = useCallback<OnDragEndResponder>(
    (result, provided) => {
      const droppedInOverflow =
        result.destination?.droppableId ===
        PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS;

      if (!droppedInOverflow) {
        setIsTabDragging(false);
      }

      toggleClickOutside(true);

      if (!onReorder) {
        return;
      }

      const shouldOpenDropdown = onReorder(result, provided);

      if (shouldOpenDropdown === true) {
        openDropdown({
          dropdownComponentInstanceIdFromProps: dropdownId,
        });
      }
    },
    [onReorder, setIsTabDragging, toggleClickOutside, openDropdown, dropdownId],
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );
  const tabSettingsOpenTabId = useRecoilComponentValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );
  const setTabSettingsOpenTabId = useSetRecoilComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const openTabSettings = useCallback(
    (tabId: string) => {
      setTabSettingsOpenTabId(tabId);
      navigatePageLayoutCommandMenu({
        commandMenuPage: CommandMenuPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
    },
    [setTabSettingsOpenTabId, navigatePageLayoutCommandMenu],
  );

  const isTabSettingsOpen = isDefined(tabSettingsOpenTabId);

  const handleSelectTab = useCallback(
    (tabId: string) => {
      if (isPageLayoutInEditMode && activeTabId === tabId) {
        openTabSettings(tabId);
        return;
      }
      if (isPageLayoutInEditMode && isTabSettingsOpen) {
        openTabSettings(tabId);
      }
      selectTab(tabId);
    },
    [
      isPageLayoutInEditMode,
      activeTabId,
      isTabSettingsOpen,
      openTabSettings,
      selectTab,
    ],
  );

  const handleSelectTabFromDropdown = useCallback(
    (tabId: string) => {
      if (isPageLayoutInEditMode && activeTabId === tabId) {
        openTabSettings(tabId);
        closeOverflowDropdown();
        return;
      }
      if (isPageLayoutInEditMode && isTabSettingsOpen) {
        openTabSettings(tabId);
      }
      selectTabFromDropdown(tabId);
    },
    [
      isPageLayoutInEditMode,
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

  const canReorderTabs = isReorderEnabled && isDefined(onReorder);

  const shouldRenderReorderableDropdown = hasHiddenTabs && canReorderTabs;

  const shouldRenderStaticDropdown = hasHiddenTabs && !canReorderTabs;

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <TabListFromUrlOptionalEffect
        isInRightDrawer={!!isInRightDrawer}
        tabListIds={tabsWithIcons.map((tab) => tab.id)}
      />

      {tabsWithIcons.length > 1 && (
        <TabListHiddenMeasurements
          visibleTabs={tabsWithIcons}
          activeTabId={activeTabId}
          loading={loading}
          onTabWidthChange={onTabWidthChange}
          onMoreButtonWidthChange={onMoreButtonWidthChange}
          onAddButtonWidthChange={onAddTab ? onAddButtonWidthChange : undefined}
          addButtonMeasurement={
            onAddTab ? (
              <StyledAddButton>
                <IconButton Icon={IconPlus} size="small" variant="tertiary" />
              </StyledAddButton>
            ) : undefined
          }
        />
      )}

      <NodeDimension onDimensionChange={onContainerWidthChange}>
        {isReorderEnabled && onReorder ? (
          <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragUpdate={handleDragUpdate}
          >
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
              />

              {shouldRenderReorderableDropdown && (
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
                />
              )}

              {onAddTab && (
                <StyledAddButton>
                  <IconButton
                    Icon={IconPlus}
                    size="small"
                    variant="tertiary"
                    onClick={() => onAddTab()}
                  />
                </StyledAddButton>
              )}
            </StyledContainer>
          </DragDropContext>
        ) : (
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
            />
            {shouldRenderStaticDropdown && (
              <PageLayoutTabListStaticOverflowDropdown
                dropdownId={dropdownId}
                hiddenTabs={hiddenTabs}
                hiddenTabsCount={hiddenTabsCount}
                isActiveTabHidden={isActiveTabHidden}
                activeTabId={activeTabId || ''}
                loading={loading}
                onSelect={handleSelectTabFromDropdown}
                onClose={closeOverflowDropdown}
              />
            )}
            {onAddTab && (
              <StyledAddButton>
                <IconButton
                  Icon={IconPlus}
                  size="small"
                  variant="tertiary"
                  onClick={() => onAddTab()}
                />
              </StyledAddButton>
            )}
          </StyledContainer>
        )}
      </NodeDimension>
    </TabListComponentInstanceContext.Provider>
  );
};
