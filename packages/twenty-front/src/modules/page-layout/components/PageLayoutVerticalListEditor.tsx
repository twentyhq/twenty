import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledVerticalListContainer = styled.div<{
  variant: PageLayoutVerticalListViewerVariant;
  shouldUseWhiteBackground: boolean;
}>`
  background: ${({ shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? themeCssVariables.background.primary
      : themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${({ variant }) =>
    variant === 'side-column'
      ? themeCssVariables.spacing[1]
      : themeCssVariables.spacing[2]};
`;

const StyledDraggableWrapper = styled.div<{ isDragging: boolean }>`
  background: ${({ isDragging }) =>
    isDragging
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  transition: background 0.1s ease;
`;

type PageLayoutVerticalListEditorProps = {
  widgets: PageLayoutWidget[];
  onReorder: (result: DropResult) => void;
  isReorderEnabled?: boolean;
  trailingElement?: ReactNode;
};

export const PageLayoutVerticalListEditor = ({
  widgets,
  onReorder,
  isReorderEnabled = true,
  trailingElement,
}: PageLayoutVerticalListEditorProps) => {
  const droppableId = `page-layout-vertical-list-${useId()}`;

  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInSidePanel,
  });

  const setPageLayoutDraggingWidgetId = useSetAtomComponentState(
    pageLayoutDraggingWidgetIdComponentState,
  );

  return (
    <DragDropContext
      onDragStart={(result) => {
        setPageLayoutDraggingWidgetId(result.draggableId);
      }}
      onDragEnd={(result) => {
        setPageLayoutDraggingWidgetId(null);
        onReorder(result);
      }}
    >
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <StyledVerticalListContainer
            ref={provided.innerRef}
            variant={variant}
            shouldUseWhiteBackground={!isInPinnedTab || isMobile}
            // oxlint-disable-next-line react/jsx-props-no-spreading
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
                    // oxlint-disable-next-line react/jsx-props-no-spreading
                    {...provided.draggableProps}
                    isDragging={snapshot.isDragging}
                  >
                    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
                    <div {...provided.dragHandleProps}>
                      <WidgetRenderer widget={widget} />
                    </div>
                  </StyledDraggableWrapper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {trailingElement}
          </StyledVerticalListContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};
