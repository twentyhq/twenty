import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { TabButton } from 'twenty-ui/input';

const StyledDraggableWrapper = styled.div`
  display: flex;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const StyledTabButtonWrapper = styled.div`
  display: flex;
  height: 100%;
  pointer-events: none;
`;

type TabListDraggableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  isDisabled: boolean | undefined;
  onSelect: () => void;
};

export const TabListDraggableTab = ({
  tab,
  index,
  isActive,
  isDisabled,
  onSelect,
}: TabListDraggableTabProps) => {
  return (
    <Draggable
      key={tab.id}
      draggableId={tab.id}
      index={index}
      isDragDisabled={isDisabled}
    >
      {(draggableProvided, draggableSnapshot) => {
        const draggableStyle = draggableProvided.draggableProps.style;
        return (
          <StyledDraggableWrapper
            ref={draggableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.dragHandleProps}
            onClick={draggableSnapshot.isDragging ? undefined : onSelect}
            style={{
              ...draggableStyle,
              cursor: draggableSnapshot.isDragging ? 'grabbing' : 'grab',
            }}
          >
            <StyledTabButtonWrapper>
              <TabButton
                id={tab.id}
                title={tab.title}
                LeftIcon={tab.Icon}
                logo={tab.logo}
                active={isActive}
                disabled={isDisabled}
                pill={tab.pill}
              />
            </StyledTabButtonWrapper>
          </StyledDraggableWrapper>
        );
      }}
    </Draggable>
  );
};
