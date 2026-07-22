import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { PageLayoutWidgetDropLine } from '@/page-layout/components/dnd/PageLayoutWidgetDropLine';
import { PageLayoutWidgetSortableItem } from '@/page-layout/components/dnd/PageLayoutWidgetSortableItem';
import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
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

// Catches drops below the last widget (append) and drops into an empty tab,
// where there is no sortable item to target.
const StyledEndDropZone = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;
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

  const { ref: endDropRef, isDropTarget: isEndDropTarget } = useDroppable({
    id: `page-layout-widget-list-${tabId}`,
    collisionDetector: pointerIntersection,
    data: endDropData,
  });

  return (
    <StyledVerticalListContainer
      variant={variant}
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      {widgets.map((widget, index) => (
        <PageLayoutWidgetSortableItem
          key={widget.id}
          widgetId={widget.id}
          tabId={tabId}
          index={index}
        >
          <WidgetRenderer widget={widget} />
        </PageLayoutWidgetSortableItem>
      ))}
      <StyledEndDropZone ref={endDropRef}>
        {isEndDropTarget && <PageLayoutWidgetDropLine />}
        {trailingElement}
      </StyledEndDropZone>
    </StyledVerticalListContainer>
  );
};
