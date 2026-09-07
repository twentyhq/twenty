import { PAGE_LAYOUT_WIDGET_DND_TYPE } from '@/page-layout/constants/PageLayoutWidgetDndType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDragData';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { type Draggable } from '@dnd-kit/abstract';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const StyledWidgetSlot = styled.div<{
  isInEditMode: boolean;
  shouldShowDivider: boolean;
}>`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;

  @container tab-viewport (min-height: 0px) {
    &.page-layout-viewport-filling-widget-slot {
      --widget-height: 100%;
      --widget-scroll-overflow: auto;

      height: calc(100cqh - var(--viewport-filling-widget-editor-block-inset));
      overflow: clip;

      .widget {
        overflow: clip;
      }

      .widget-card-header {
        background: var(--record-card-background-color);
        position: sticky;
        top: 0;
        z-index: 3;
      }
    }
  }

  &:not(:last-child) {
    border-bottom: ${({ isInEditMode, shouldShowDivider }) =>
      !isInEditMode && shouldShowDivider
        ? `1px solid ${themeCssVariables.border.color.light}`
        : 'none'};
  }
`;

type PageLayoutVerticalListWidgetSlotProps = {
  canAcceptWidgetDrag: (source: Draggable) => boolean;
  index: number;
  isInEditMode: boolean;
  isSoloCanvasPresentation: boolean;
  layoutMode: PageLayoutTabLayoutMode;
  shouldShowDivider: boolean;
  tabId: string;
  widget: PageLayoutWidget;
};

export const PageLayoutVerticalListWidgetSlot = ({
  canAcceptWidgetDrag,
  index,
  isInEditMode,
  isSoloCanvasPresentation,
  layoutMode,
  shouldShowDivider,
  tabId,
  widget,
}: PageLayoutVerticalListWidgetSlotProps) => {
  const fillsViewport =
    isSoloCanvasPresentation ||
    (layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
      isViewportFillingWidgetType(widget.type));

  const widgetDragData: PageLayoutWidgetDragData = {
    type: 'widget',
    widgetId: widget.id,
    widgetType: widget.type,
    tabId,
    index,
  };

  return (
    <StyledWidgetSlot
      className={
        fillsViewport ? 'page-layout-viewport-filling-widget-slot' : undefined
      }
      isInEditMode={isInEditMode}
      shouldShowDivider={shouldShowDivider}
    >
      <DragDropItemDropTarget
        index={index}
        droppableId={tabId}
        orientation="horizontal"
        compact
      />
      <DragDropItemSortableCell
        id={widget.id}
        index={index}
        group={tabId}
        data={widgetDragData}
        type={PAGE_LAYOUT_WIDGET_DND_TYPE}
        accept={canAcceptWidgetDrag}
        allowNativeDragWhenDisabled
        disabled={!isInEditMode}
        hasTransition={false}
        highlightWhileDragging={isInEditMode}
        orientation="horizontal"
        fill={fillsViewport}
      >
        <WidgetRenderer widget={widget} />
      </DragDropItemSortableCell>
    </StyledWidgetSlot>
  );
};
