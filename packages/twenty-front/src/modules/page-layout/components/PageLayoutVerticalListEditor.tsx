import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useId } from 'react';
import { PageLayoutType, type PageLayoutWidget } from '~/generated/graphql';

const StyledVerticalListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDraggableWrapper = styled.div<{ isDragging: boolean }>`
  background: ${({ theme, isDragging }) =>
    isDragging ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background 0.1s ease;
`;

type PageLayoutVerticalListEditorProps = {
  widgets: PageLayoutWidget[];
  onReorder: (result: DropResult) => void;
};

export const PageLayoutVerticalListEditor = ({
  widgets,
  onReorder,
}: PageLayoutVerticalListEditorProps) => {
  const droppableId = `page-layout-vertical-list-${useId()}`;

  const setDraggingWidgetId = useSetRecoilComponentState(
    pageLayoutDraggingWidgetIdComponentState,
  );

  return (
    <DragDropContext
      onDragStart={(result) => {
        setDraggingWidgetId(result.draggableId);
      }}
      onDragEnd={(result) => {
        setDraggingWidgetId(null);
        onReorder(result);
      }}
    >
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <StyledVerticalListContainer
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <StyledDraggableWrapper
                    ref={provided.innerRef}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...provided.draggableProps}
                    isDragging={snapshot.isDragging}
                  >
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <div {...provided.dragHandleProps}>
                      <WidgetRenderer
                        widget={widget}
                        pageLayoutType={PageLayoutType.RECORD_PAGE}
                        layoutMode="vertical-list"
                      />
                    </div>
                  </StyledDraggableWrapper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledVerticalListContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};
