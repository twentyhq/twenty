import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDragData';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';
import { PAGE_LAYOUT_WIDGET_DND_TYPE } from '@/page-layout/constants/PageLayoutWidgetDndType';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { DragDropItemEndDropZone } from '@/ui/utilities/drag-and-drop/components/DragDropItemEndDropZone';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
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

const StyledEndDropZone = styled(DragDropItemEndDropZone)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: ${themeCssVariables.spacing[6]};
`;

type PageLayoutVerticalListEditorProps = {
  widgets: PageLayoutWidget[];
  trailingElement?: ReactNode;
};

export const PageLayoutVerticalListEditor = ({
  widgets,
  trailingElement,
}: PageLayoutVerticalListEditorProps) => {
  const { tabId } = usePageLayoutContentContext();

  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInSidePanel,
  });

  const endDropData: PageLayoutWidgetListDropData = {
    type: 'widget-list',
    tabId,
  };

  return (
    <StyledVerticalListContainer
      variant={variant}
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      {widgets.map((widget, index) => {
        const widgetDragData: PageLayoutWidgetDragData = {
          type: 'widget',
          widgetId: widget.id,
          tabId,
          index,
        };

        return (
          <DragDropItemSortableCell
            key={widget.id}
            id={widget.id}
            index={index}
            group={tabId}
            data={widgetDragData}
            type={PAGE_LAYOUT_WIDGET_DND_TYPE}
            accept={PAGE_LAYOUT_WIDGET_DND_TYPE}
            hasTransition={false}
            highlightWhileDragging={true}
            dropLine="horizontal"
          >
            <WidgetRenderer widget={widget} />
          </DragDropItemSortableCell>
        );
      })}
      <StyledEndDropZone
        id={`page-layout-widget-list-${tabId}`}
        accept={PAGE_LAYOUT_WIDGET_DND_TYPE}
        data={endDropData}
      >
        {trailingElement}
      </StyledEndDropZone>
    </StyledVerticalListContainer>
  );
};
