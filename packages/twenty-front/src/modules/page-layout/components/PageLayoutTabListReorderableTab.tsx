import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { TabButton } from 'twenty-ui/input';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

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

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  isActive,
  disabled,
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  return (
    <Draggable draggableId={tab.id} index={index} isDragDisabled={disabled}>
      {(draggableProvided, draggableSnapshot) => (
        <StyledDraggableWrapper
          ref={draggableProvided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.dragHandleProps}
          onClick={draggableSnapshot.isDragging ? undefined : onSelect}
          style={{
            ...draggableProvided.draggableProps.style,
            cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
          }}
        >
          <StyledTabButtonWrapper>
            <TabButton
              id={tab.id}
              title={tab.title}
              LeftIcon={tab.Icon}
              logo={tab.logo}
              active={isActive}
              disabled={disabled}
              pill={tab.pill}
            />
          </StyledTabButtonWrapper>
        </StyledDraggableWrapper>
      )}
    </Draggable>
  );
};
