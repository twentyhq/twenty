import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TAB_LIST_DROPPABLE_IDS } from '@/ui/layout/tab-list/constants/TabListDroppableIds';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  Draggable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
  Droppable,
} from '@hello-pangea/dnd';
import { useTabListStateContextOrThrow } from '../contexts/TabListStateContext';
import { TabListDropdownMenuItem } from './TabListDropdownMenuItem';

type TabListDropdownDraggableContentProps = {
  onSelect: (tabId: string) => void;
};

const StyledDraggableWrapper = styled.div`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const TabListDropdownDraggableContent = ({
  onSelect,
}: TabListDropdownDraggableContentProps) => {
  const theme = useTheme();
  const { hiddenTabs, activeTabId, loading, visibleTabCount } =
    useTabListStateContextOrThrow();

  const renderClone = (
    provided: DraggableProvided,
    _snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    const hiddenIndex = rubric.source.index - visibleTabCount;
    const tab = hiddenTabs[hiddenIndex];
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
        <TabListDropdownMenuItem
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
        droppableId={TAB_LIST_DROPPABLE_IDS.HIDDEN_TABS}
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
                          <TabListDropdownMenuItem
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
