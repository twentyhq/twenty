import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useId } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledVerticalListContainer = styled.div<{
  variant: PageLayoutVerticalListViewerVariant;
  shouldUseWhiteBackground: boolean;
}>`
  background: ${({ theme, shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? theme.background.primary
      : theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme, variant }) =>
    variant === 'side-column' ? theme.spacing(1) : theme.spacing(2)};
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
  isReorderEnabled?: boolean;
};

export const PageLayoutVerticalListEditor = ({
  widgets,
  onReorder,
  isReorderEnabled = true,
}: PageLayoutVerticalListEditorProps) => {
  const droppableId = `page-layout-vertical-list-${useId()}`;

  const { isInRightDrawer } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInRightDrawer,
  });

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
            variant={variant}
            shouldUseWhiteBackground={isMobile || isInRightDrawer}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
          >
            {widgets.map((widget, index) => (
              <Draggable
                key={widget.id}
                draggableId={widget.id}
                index={index}
                isDragDisabled={!isReorderEnabled}
              >
                {(provided, snapshot) => (
                  <StyledDraggableWrapper
                    ref={provided.innerRef}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...provided.draggableProps}
                    isDragging={snapshot.isDragging}
                  >
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <div {...provided.dragHandleProps}>
                      <WidgetRenderer widget={widget} />
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
