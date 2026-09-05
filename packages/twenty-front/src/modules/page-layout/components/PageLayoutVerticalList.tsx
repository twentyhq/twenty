import { PageLayoutVerticalListWidgetSlot } from '@/page-layout/components/PageLayoutVerticalListWidgetSlot';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';
import { canVerticalListAcceptWidgetDrag } from '@/page-layout/utils/canVerticalListAcceptWidgetDrag';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { WorkflowDiagramAllowPageScrollContext } from '@/workflow/workflow-diagram/contexts/WorkflowDiagramAllowPageScrollContext';
import { type Draggable } from '@dnd-kit/abstract';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { Fragment, type ReactNode, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const StyledVerticalListContainer = styled.div<{
  isInEditMode: boolean;
  isInPinnedTab: boolean;
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
  min-height: ${({ isInEditMode }) => (isInEditMode ? '0' : '100%')};
  // The pinned tab sits next to the main tab area, so while editing it takes
  // that area's vertical padding to line their widgets up, and keeps the
  // tighter side-column one horizontally where the narrow column needs the
  // room.
  padding: ${({ isInEditMode, isInPinnedTab, isSideColumnContext }) =>
    isInEditMode
      ? isInPinnedTab
        ? `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}`
        : isSideColumnContext
          ? themeCssVariables.spacing[1]
          : themeCssVariables.spacing[2]
      : '0'};
`;

const StyledHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledDropTarget = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;

  &:not(:first-child) {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

type PageLayoutVerticalListProps = {
  isInEditMode: boolean;
  widgets: PageLayoutWidget[];
  leadingElement?: ReactNode;
  trailingElement?: ReactNode;
  renderWidgetSeparator?: (widget: PageLayoutWidget) => ReactNode;
};

export const PageLayoutVerticalList = ({
  isInEditMode,
  widgets,
  leadingElement,
  trailingElement,
  renderWidgetSeparator,
}: PageLayoutVerticalListProps) => {
  const { layoutMode, tabId } = usePageLayoutContentContext();

  const { isInPinnedTab, isMobile, isSideColumnContext } =
    useIsSideColumnContext();

  // The migration skips tabs with multiple stored widgets, even if only one is visible.
  const isLegacyCanvasViewport =
    layoutMode === PageLayoutTabLayoutMode.CANVAS &&
    widgets.length === 1 &&
    !isInEditMode &&
    !isInPinnedTab;

  // A viewport-filling slot is exactly one viewport tall, so the list only
  // overflows when something else shares it. Widgets that capture the wheel
  // (workflow canvases) must keep it when there is no page scroll to reach.
  const hasPageScroll = isInEditMode || widgets.length > 1;

  const firstViewportFillingWidgetIndex = widgets.findIndex(
    isViewportFillingWidget,
  );
  const hasViewportFillingWidget = firstViewportFillingWidgetIndex !== -1;

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
    disabled: !isInEditMode || hasViewportFillingWidget,
  });

  return (
    <StyledVerticalListContainer
      isInEditMode={isInEditMode}
      isInPinnedTab={isInPinnedTab}
      isSideColumnContext={isSideColumnContext}
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      <WorkflowDiagramAllowPageScrollContext.Provider value={hasPageScroll}>
        {isInEditMode && isDefined(leadingElement) && (
          <StyledHeader>{leadingElement}</StyledHeader>
        )}
        {widgets.map((widget, index) => (
          <Fragment key={widget.id}>
            {isInEditMode &&
              index > 0 &&
              (!hasViewportFillingWidget ||
                index <= firstViewportFillingWidgetIndex) &&
              renderWidgetSeparator?.(widget)}
            <PageLayoutVerticalListWidgetSlot
              canAcceptWidgetDrag={canAcceptWidgetDrag}
              index={index}
              isInEditMode={isInEditMode}
              fillsViewport={
                isLegacyCanvasViewport ||
                (layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
                  isViewportFillingWidget(widget))
              }
              shouldShowDivider={isSideColumnContext}
              tabId={tabId}
              widget={widget}
            />
          </Fragment>
        ))}
        {isInEditMode && !hasViewportFillingWidget && (
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
