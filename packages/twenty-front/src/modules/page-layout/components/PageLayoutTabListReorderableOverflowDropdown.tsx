import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Draggable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListDroppableMoreButton } from '@/page-layout/components/PageLayoutTabListDroppableMoreButton';
import { PageLayoutTabRenderClone } from '@/page-layout/components/PageLayoutTabRenderClone';
import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useContext } from 'react';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

const StyledOverflowDropdownListDraggableWrapper = styled.div`
  display: flex;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

type PageLayoutTabListReorderableOverflowDropdownProps = {
  dropdownId: string;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  visibleTabCount: number;
  onClose: () => void;
};

export const PageLayoutTabListReorderableOverflowDropdown = ({
  dropdownId,
  hiddenTabs,
  hiddenTabsCount,
  isActiveTabHidden,
  activeTabId,
  loading,
  onSelect,
  visibleTabCount,
  onClose,
}: PageLayoutTabListReorderableOverflowDropdownProps) => {
  const theme = useTheme();
  const context = useContext(TabListComponentInstanceContext);
  const instanceId = context?.instanceId;

  const isTabDragging = useRecoilComponentValue(
    isPageLayoutTabDraggingComponentState,
    instanceId,
  );

  const setIsTabDragging = useSetRecoilComponentState(
    isPageLayoutTabDraggingComponentState,
    instanceId,
  );

  const handleClose = () => {
    if (!isTabDragging) {
      onClose();
    }
  };

  const handleTabSelect = (tabId: string) => {
    setIsTabDragging(false);
    onSelect(tabId);
    handleClose();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClickOutside={handleClose}
      clickableComponent={
        <PageLayoutTabListDroppableMoreButton
          hiddenTabsCount={hiddenTabsCount}
          isActiveTabHidden={isActiveTabHidden}
          data-dropdown-id={dropdownId}
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <Droppable
            droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
            renderClone={(
              provided: DraggableProvided,
              _snapshot: DraggableStateSnapshot,
              rubric: DraggableRubric,
            ) => {
              const overflowIndex = rubric.source.index - visibleTabCount;
              const tab = hiddenTabs[overflowIndex];

              return (
                <PageLayoutTabRenderClone
                  provided={provided}
                  tab={tab}
                  activeTabId={activeTabId}
                />
              );
            }}
          >
            {(provided) => (
              <DropdownMenuItemsContainer>
                <div
                  ref={provided.innerRef}
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                >
                  {hiddenTabs.map((tab, index) => {
                    const globalIndex = visibleTabCount + index;
                    const disabled = tab.disabled ?? loading;

                    return (
                      <Draggable
                        key={tab.id}
                        draggableId={tab.id}
                        index={globalIndex}
                        isDragDisabled={disabled}
                      >
                        {(draggableProvided, draggableSnapshot) => (
                          <StyledOverflowDropdownListDraggableWrapper
                            ref={draggableProvided.innerRef}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...draggableProvided.draggableProps}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...draggableProvided.dragHandleProps}
                            style={{
                              ...draggableProvided.draggableProps.style,
                              position: 'relative',
                              left: 'auto',
                              top: 'auto',
                              cursor: draggableSnapshot.isDragging
                                ? 'grabbing'
                                : 'grab',
                              background: draggableSnapshot.isDragging
                                ? theme.background.transparent.light
                                : 'none',
                              width: 50,
                              overflow: 'visible',
                            }}
                          >
                            <div
                              style={{
                                minWidth:
                                  GenericDropdownContentWidth.Medium -
                                  theme.spacingMultiplicator * 2,
                              }}
                            >
                              <MenuItemSelectAvatar
                                text={tab.title}
                                avatar={<TabAvatar tab={tab} />}
                                selected={tab.id === activeTabId}
                                onClick={
                                  draggableSnapshot.isDragging
                                    ? undefined
                                    : () => handleTabSelect(tab.id)
                                }
                                disabled={disabled}
                              />
                            </div>
                          </StyledOverflowDropdownListDraggableWrapper>
                        )}
                      </Draggable>
                    );
                  })}
                  <div>{provided.placeholder}</div>
                </div>
              </DropdownMenuItemsContainer>
            )}
          </Droppable>
        </DropdownContent>
      }
    />
  );
};
