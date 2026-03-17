import { styled } from '@linaria/react';
import {
  DragDropContext,
  type DropResult,
  type OnDragEndResponder,
  type OnDragStartResponder,
  type OnDragUpdateResponder,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

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
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import { TabListDropdown } from '@/ui/layout/tab-list/components/TabListDropdown';
import { PageLayoutTabListVisibleTabs } from '@/page-layout/components/PageLayoutTabListVisibleTabs';
import { STANDARD_PAGE_LAYOUT_TAB_TITLE_TRANSLATIONS } from '@/page-layout/constants/StandardPageLayoutTabTitleTranslations';
import { useIsCurrentObjectCustom } from '@/page-layout/hooks/useIsCurrentObjectCustom';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutType } from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${TAB_LIST_HEIGHT};
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
  onAddTab?: () => void;
  onReorder?: (result: DropResult, provided: ResponderProvided) => boolean;
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
  onAddTab,
  isReorderEnabled,
  onReorder,
  pageLayoutType,
}: PageLayoutTabListProps) => {
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const { isCustom } = useIsCurrentObjectCustom();

  const shouldTranslateTabTitles = !isCustom;

  const tabsWithIcons: SingleTabProps[] = tabs.map((tab) => ({
    id: tab.id,
    // TODO: drop once the configuration of all record page layouts has been migrated to the backend.
    title:
      shouldTranslateTabTitles &&
      isDefined(STANDARD_PAGE_LAYOUT_TAB_TITLE_TRANSLATIONS[tab.title])
        ? t(STANDARD_PAGE_LAYOUT_TAB_TITLE_TRANSLATIONS[tab.title])
        : tab.title,
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
    hasAddButton: isDefined(onAddTab),
  });

  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const dropdownId = `tab-overflow-${componentInstanceId}`;
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

  const setPageLayoutTabListCurrentDragDroppableId = useSetAtomComponentState(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
    pageLayoutId,
  );

  const handleDragUpdate: OnDragUpdateResponder = (update) => {
    setPageLayoutTabListCurrentDragDroppableId(update.destination?.droppableId);
  };

  const handleDragStart = useCallback<OnDragStartResponder>(() => {
    setIsPageLayoutTabDragging(true);
    toggleClickOutside(false);
  }, [setIsPageLayoutTabDragging, toggleClickOutside]);

  const handleDragEnd = useCallback<OnDragEndResponder>(
    (result, provided) => {
      const droppedInOverflow =
        result.destination?.droppableId ===
        PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS;

      if (!droppedInOverflow) {
        setIsPageLayoutTabDragging(false);
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
    [
      onReorder,
      setIsPageLayoutTabDragging,
      toggleClickOutside,
      openDropdown,
      dropdownId,
    ],
  );

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

  const canReorderTabs = isReorderEnabled && isDefined(onReorder);

  const shouldRenderReorderableDropdown = hasHiddenTabs && canReorderTabs;

  const shouldRenderStaticDropdown = hasHiddenTabs && !canReorderTabs;

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
