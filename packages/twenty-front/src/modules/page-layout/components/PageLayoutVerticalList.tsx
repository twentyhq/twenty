import { PageLayoutVerticalListWidgetSlot } from '@/page-layout/components/PageLayoutVerticalListWidgetSlot';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';
import { canVerticalListAcceptWidgetDrag } from '@/page-layout/utils/canVerticalListAcceptWidgetDrag';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { WorkflowDiagramAllowPageScrollContext } from '@/workflow/workflow-diagram/contexts/WorkflowDiagramAllowPageScrollContext';
import { type Draggable } from '@dnd-kit/abstract';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode, useCallback } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const StyledVerticalListContainer = styled.div<{
  isInEditMode: boolean;
  isSideColumnContext: boolean;
  shouldUseWhiteBackground: boolean;
}>`
  --record-card-background-color: ${({ shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? themeCssVariables.background.primary
      : themeCssVariables.background.secondary};
  --viewport-filling-widget-editor-block-inset: ${({
    isInEditMode,
    isSideColumnContext,
  }) =>
    isInEditMode
      ? isSideColumnContext
        ? themeCssVariables.spacing[2]
        : themeCssVariables.spacing[4]
      : '0px'};
  --widget-card-content-overflow: visible;
  --widget-height: auto;
  --widget-scroll-overflow: visible;

  background: var(--record-card-background-color);
  display: flex;
  flex-direction: column;
  gap: ${({ isInEditMode }) =>
    isInEditMode ? themeCssVariables.spacing[4] : '0'};
  min-height: ${({ isInEditMode }) => (isInEditMode ? '0' : '100%')};
  padding: ${({ isInEditMode, isSideColumnContext }) =>
    isInEditMode
      ? isSideColumnContext
        ? themeCssVariables.spacing[1]
        : themeCssVariables.spacing[2]
      : '0'};
`;

const StyledDropTarget = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;
`;

type PageLayoutVerticalListProps = {
  isInEditMode: boolean;
  widgets: PageLayoutWidget[];
  trailingElement?: ReactNode;
};

export const PageLayoutVerticalList = ({
  isInEditMode,
  widgets,
  trailingElement,
}: PageLayoutVerticalListProps) => {
  const { layoutMode, tabId } = usePageLayoutContentContext();

  const { isInPinnedTab, isMobile, isSideColumnContext } =
    useIsSideColumnContext();

  const shouldUseSoloCanvasPresentation =
    layoutMode === PageLayoutTabLayoutMode.CANVAS &&
    getIsSingleWidgetTab({
      tab: {
        layoutMode,
        widgets,
      },
    }) &&
    !isInEditMode &&
    !isInPinnedTab;

  // A viewport-filling slot is exactly one viewport tall, so the list only
  // overflows when something else shares it. Widgets that capture the wheel
  // (workflow canvases) must keep it when there is no page scroll to reach.
  const hasPageScroll = isInEditMode || widgets.length > 1;

  const endDropData: PageLayoutWidgetListDropData = {
    type: 'widget-list',
    tabId,
    itemCount: widgets.length,
  };

  const canAcceptWidgetDrag = useCallback(
    (source: Draggable) =>
      canVerticalListAcceptWidgetDrag({
        destinationWidgets: widgets,
        source,
      }),
    [widgets],
  );

  const { ref: endDropZoneRef } = useDroppable({
    id: `page-layout-widget-list-${tabId}`,
    accept: canAcceptWidgetDrag,
    collisionDetector: pointerIntersection,
    data: endDropData,
    disabled: !isInEditMode,
  });

  return (
    <StyledVerticalListContainer
      isInEditMode={isInEditMode}
      isSideColumnContext={isSideColumnContext}
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      <WorkflowDiagramAllowPageScrollContext.Provider value={hasPageScroll}>
        {widgets.map((widget, index) => (
          <PageLayoutVerticalListWidgetSlot
            canAcceptWidgetDrag={canAcceptWidgetDrag}
            index={index}
            isInEditMode={isInEditMode}
            isSoloCanvasPresentation={shouldUseSoloCanvasPresentation}
            key={widget.id}
            layoutMode={layoutMode}
            shouldShowDivider={isSideColumnContext}
            tabId={tabId}
            widget={widget}
          />
        ))}
        {isInEditMode && (
          <StyledDropTarget ref={endDropZoneRef}>
            <DragDropItemDropTarget
              index={widgets.length}
              droppableId={tabId}
              orientation="horizontal"
              compact
            />
            {trailingElement}
          </StyledDropTarget>
        )}
      </WorkflowDiagramAllowPageScrollContext.Provider>
    </StyledVerticalListContainer>
  );
};
