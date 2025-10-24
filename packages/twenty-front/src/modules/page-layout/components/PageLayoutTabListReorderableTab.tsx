import { Draggable } from '@hello-pangea/dnd';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

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
        <StyledTabContainer
          ref={draggableProvided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.dragHandleProps}
          onClick={draggableSnapshot.isDragging ? undefined : onSelect}
          active={isActive}
          disabled={disabled}
          style={{
            ...draggableProvided.draggableProps.style,
            cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
          }}
        >
          <TabContent
            id={tab.id}
            active={isActive}
            disabled={disabled}
            LeftIcon={tab.Icon}
            title={tab.title}
            logo={tab.logo}
            pill={tab.pill}
          />
        </StyledTabContainer>
      )}
    </Draggable>
  );
};
