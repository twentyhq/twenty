import { PAGE_LAYOUT_WIDGET_DND_TYPE } from '@/page-layout/constants/PageLayoutWidgetDndType';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDragData';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { getWidgetVerticalListSizing } from '@/page-layout/widgets/utils/getWidgetVerticalListSizing';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
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

  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();
  const isSideColumnContext = useIsSideColumnContext();

  const endDropData: PageLayoutWidgetListDropData = {
    type: 'widget-list',
    tabId,
    itemCount: widgets.length,
  };

  const { ref: endDropZoneRef } = useDroppable({
    id: `page-layout-widget-list-${tabId}`,
    accept: PAGE_LAYOUT_WIDGET_DND_TYPE,
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
      {widgets.map((widget, index) => {
        const fillsViewport =
          layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
          getWidgetVerticalListSizing(widget.type) === 'FILL_VIEWPORT';

        const widgetDragData: PageLayoutWidgetDragData = {
          type: 'widget',
          widgetId: widget.id,
          tabId,
          index,
        };

        return (
          <StyledWidgetSlot
            className={
              fillsViewport
                ? 'page-layout-viewport-filling-widget-slot'
                : undefined
            }
            isInEditMode={isInEditMode}
            key={widget.id}
            shouldShowDivider={isSideColumnContext}
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
              accept={PAGE_LAYOUT_WIDGET_DND_TYPE}
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
      })}
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
    </StyledVerticalListContainer>
  );
};
