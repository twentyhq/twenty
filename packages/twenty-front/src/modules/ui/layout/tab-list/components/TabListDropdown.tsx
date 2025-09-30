import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { TAB_LIST_DROPPABLE_IDS } from '@/ui/layout/tab-list/constants/TabListDroppableIds';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Draggable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

const StyledDraggableWrapper = styled.div`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

type TabListDropdownProps = {
  dropdownId: string;
  onClose: () => void;
  overflow: {
    hiddenTabsCount: number;
    isActiveTabHidden: boolean;
  };
  hiddenTabs: SingleTabProps[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  loading?: boolean;
  isDraggable?: boolean;
  visibleTabCount?: number;
};

export const TabListDropdown = ({
  dropdownId,
  onClose,
  overflow,
  hiddenTabs,
  activeTabId,
  onTabSelect,
  loading,
  isDraggable,
  visibleTabCount,
}: TabListDropdownProps) => {
  const theme = useTheme();

  const renderClone = (
    provided: DraggableProvided,
    _snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const tab = hiddenTabs[rubric.source.index - (visibleTabCount ?? 0)];
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
          disabled={tab.disabled ?? loading}
        />
      </StyledDraggableWrapper>
    );
  };

  const dropdownComponents = isDraggable ? (
    <DropdownContent>
      <Droppable
        droppableId={TAB_LIST_DROPPABLE_IDS.HIDDEN_TABS}
        renderClone={renderClone}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            <DropdownMenuItemsContainer scrollable={false}>
              {hiddenTabs.map((tab, index) => {
                const isDisabled = tab.disabled ?? loading;
                const globalIndex = (visibleTabCount ?? 0) + index;

                return (
                  <Draggable
                    key={tab.id}
                    draggableId={tab.id}
                    index={globalIndex}
                    isDragDisabled={isDisabled}
                  >
                    {(draggableProvided, draggableSnapshot) => {
                      const draggableStyle =
                        draggableProvided.draggableProps.style;
                      return (
                        <StyledDraggableWrapper
                          ref={draggableProvided.innerRef}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...draggableProvided.draggableProps}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...draggableProvided.dragHandleProps}
                          style={{
                            ...draggableStyle,
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
                              isDisabled || draggableSnapshot.isDragging
                                ? undefined
                                : () => {
                                    onTabSelect(tab.id);
                                    onClose();
                                  }
                            }
                            disabled={isDisabled}
                          />
                        </StyledDraggableWrapper>
                      );
                    }}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </DropdownMenuItemsContainer>
          </div>
        )}
      </Droppable>
    </DropdownContent>
  ) : (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {hiddenTabs.map((tab) => {
          const isDisabled = tab.disabled ?? loading;

          return (
            <MenuItemSelectAvatar
              key={tab.id}
              text={tab.title}
              avatar={<TabAvatar tab={tab} />}
              selected={tab.id === activeTabId}
              onClick={
                isDisabled
                  ? undefined
                  : () => {
                      onTabSelect(tab.id);
                      onClose();
                    }
              }
              disabled={isDisabled}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClickOutside={onClose}
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={
        <TabMoreButton
          hiddenTabsCount={overflow.hiddenTabsCount}
          active={overflow.isActiveTabHidden}
        />
      }
      dropdownComponents={dropdownComponents}
    />
  );
};
