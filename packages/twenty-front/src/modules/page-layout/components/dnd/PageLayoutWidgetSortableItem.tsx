import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PageLayoutWidgetDropLine } from '@/page-layout/components/dnd/PageLayoutWidgetDropLine';
import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { preventNativeDragStart } from '@/ui/utilities/drag-and-drop/utils/preventNativeDragStart';

const PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];

const StyledSortableRoot = styled.div<{ isDragging: boolean }>`
  background: ${({ isDragging }) =>
    isDragging
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-height: 0;
  position: relative;
  transition: background 0.1s ease;
`;

type PageLayoutWidgetSortableItemProps = {
  widgetId: string;
  tabId: string;
  index: number;
  children: ReactNode;
};

export const PageLayoutWidgetSortableItem = ({
  widgetId,
  tabId,
  index,
  children,
}: PageLayoutWidgetSortableItemProps) => {
  const data: PageLayoutWidgetDragData = {
    type: 'widget',
    widgetId,
    tabId,
    index,
  };

  const { ref, isDragging, isDropTarget } = useSortable({
    id: widgetId,
    index,
    group: tabId,
    data,
    transition: null,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });

  return (
    <StyledSortableRoot
      ref={ref}
      isDragging={isDragging}
      onDragStart={preventNativeDragStart}
    >
      {isDropTarget && <PageLayoutWidgetDropLine />}
      {children}
    </StyledSortableRoot>
  );
};
