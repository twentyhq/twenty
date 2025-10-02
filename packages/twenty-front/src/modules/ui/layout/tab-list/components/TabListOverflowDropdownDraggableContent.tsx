import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabListDropdownMenuItemWithActions } from '@/ui/layout/tab-list/components/TabListDropdownMenuItemWithActions';
import { TAB_LIST_DROPPABLE_IDS } from '@/ui/layout/tab-list/constants/TabListDroppableIds';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Draggable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';

type TabListOverflowDropdownDraggableContentProps = {
  onSelect: (tabId: string) => void;
};

const StyledDraggableWrapper = styled.div`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const TabListOverflowDropdownDraggableContent = ({
  onSelect,
}: TabListOverflowDropdownDraggableContentProps) => {
  const theme = useTheme();
  const { overflowingTabs, activeTabId, loading, visibleTabCount } =
    useTabListContextOrThrow();

  const renderClone = (
    provided: DraggableProvided,
    _snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const overflowIndex = rubric.source.index - visibleTabCount;
    const tab = overflowingTabs[overflowIndex];
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
        <TabListDropdownMenuItemWithActions
          tab={tab}
          activeTabId={activeTabId}
          loading={loading}
          onSelect={onSelect}
          disableClick
        />
      </StyledDraggableWrapper>
    );
  };

  return (
    <DropdownContent>
      <Droppable
        droppableId={TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
        renderClone={renderClone}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            <DropdownMenuItemsContainer>
              {overflowingTabs.map((tab, index) => {
                const globalIndex = visibleTabCount + index;

                return (
                  <Draggable
                    key={tab.id}
                    draggableId={tab.id}
                    index={globalIndex}
                    isDragDisabled={tab.disabled ?? loading}
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
                          <TabListDropdownMenuItemWithActions
                            tab={tab}
                            activeTabId={activeTabId}
                            loading={loading}
                            onSelect={onSelect}
                            disableClick={draggableSnapshot.isDragging}
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
  );
};
