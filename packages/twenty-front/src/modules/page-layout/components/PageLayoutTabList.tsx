import styled from '@emotion/styled';
import {
  DragDropContext,
  type DropResult,
  type OnDragEndResponder,
  type OnDragStartResponder,
  type OnDragUpdateResponder,
  type ResponderProvided,
} from '@hello-pangea/dnd';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
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

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListReorderableOverflowDropdown } from '@/page-layout/components/PageLayoutTabListReorderableOverflowDropdown';
import { PageLayoutTabListStaticOverflowDropdown } from '@/page-layout/components/PageLayoutTabListStaticOverflowDropdown';
import { PageLayoutTabListVisibleTabs } from '@/page-layout/components/PageLayoutTabListVisibleTabs';
import { pageLayoutTabListCurrentDragDroppableIdComponentState } from '@/page-layout/states/pageLayoutTabListCurrentDragDroppableIdComponentState';
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

type PageLayoutTabListProps = TabListProps & {
  isReorderEnabled: boolean;
  onAddTab?: () => void;
  onReorder?: (result: DropResult, provided: ResponderProvided) => boolean;
};

export const PageLayoutTabList = ({
  tabs,
  loading,
  behaveAsLinks = true,
  isInRightDrawer,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isReorderEnabled,
  onReorder,
}: PageLayoutTabListProps) => {
  const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hide), [tabs]);
  const navigate = useNavigate();

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
  const initialActiveTabId = activeTabExists ? activeTabId : visibleTabs[0]?.id;

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
    visibleTabs,
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

  useEffect(() => {
    setActiveTabId(initialActiveTabId);
    onChangeTab?.(initialActiveTabId || '');
  }, [initialActiveTabId, setActiveTabId, onChangeTab]);

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

  const [
    pageLayoutTabListCurrentDragDroppableId,
    setPageLayoutTabListCurrentDragDroppableId,
  ] = useRecoilComponentState(
    pageLayoutTabListCurrentDragDroppableIdComponentState,
  );

  const handleDragUpdate: OnDragUpdateResponder = (update, provided) => {
    setPageLayoutTabListCurrentDragDroppableId(update.destination?.droppableId);

    // simple one-off (runs while dragging)
    const placeholderElementSelector = '[data-rfd-placeholder-context-id]';

    const placeholderElement = document.querySelector<HTMLDivElement>(
      placeholderElementSelector,
    );

    console.log({
      placeholderElement,
    });

    if (isDefined(placeholderElement)) {
      // example: add a class or inline style
      // el.classList.add('my-custom-placeholder');
      // // or set inline style (careful: library writes inline size)
      // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
      placeholderElement.style.background = 'rgba(106, 177, 235, 0.08)';
      placeholderElement.style.border = '2px dashed rgba(33,150,243,0.6)';
    }

    console.log({
      update,
      provided,
    });
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

  if (visibleTabs.length === 0) {
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
        tabListIds={tabs.map((tab) => tab.id)}
      />

      {visibleTabs.length > 1 && (
        <TabListHiddenMeasurements
          visibleTabs={visibleTabs}
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
                visibleTabs={visibleTabs}
                visibleTabCount={visibleTabCount}
                activeTabId={activeTabId}
                behaveAsLinks={behaveAsLinks}
                loading={loading}
                onChangeTab={onChangeTab}
                onSelectTab={selectTab}
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
                  onSelect={selectTabFromDropdown}
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
              visibleTabs={visibleTabs}
              visibleTabCount={visibleTabCount}
              activeTabId={activeTabId}
              behaveAsLinks={behaveAsLinks}
              loading={loading}
              onChangeTab={onChangeTab}
              onSelectTab={selectTab}
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
                onSelect={selectTabFromDropdown}
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
