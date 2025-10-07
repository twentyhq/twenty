import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Draggable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

const StyledDraggableWrapper = styled.div`
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

  const renderClone = (
    provided: DraggableProvided,
    _snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const overflowIndex = rubric.source.index - visibleTabCount;
    const tab = hiddenTabs[overflowIndex];
    if (!tab) return null;

    return (
      <StyledDraggableWrapper
        ref={provided.innerRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          cursor: 'grabbing',
        }}
      >
        <MenuItemSelectAvatar
          text={tab.title}
          avatar={<TabAvatar tab={tab} />}
          selected={tab.id === activeTabId}
          onClick={undefined}
          disabled
        />
      </StyledDraggableWrapper>
    );
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClickOutside={onClose}
      clickableComponent={
        <TabMoreButton hiddenTabsCount={hiddenTabsCount} active={isActiveTabHidden} />
      }
      dropdownComponents={
        <DropdownContent>
          <Droppable
            droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
            renderClone={renderClone}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
              >
                <DropdownMenuItemsContainer>
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
                          <StyledDraggableWrapper
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
                            }}
                          >
                            <MenuItemSelectAvatar
                              text={tab.title}
                              avatar={<TabAvatar tab={tab} />}
                              selected={tab.id === activeTabId}
                              onClick={
                                draggableSnapshot.isDragging
                                  ? undefined
                                  : () => {
                                      onSelect(tab.id);
                                      onClose();
                                    }
                              }
                              disabled={disabled}
                            />
                          </StyledDraggableWrapper>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </DropdownMenuItemsContainer>
              </div>
            )}
          </Droppable>
        </DropdownContent>
      }
    />
  );
};
