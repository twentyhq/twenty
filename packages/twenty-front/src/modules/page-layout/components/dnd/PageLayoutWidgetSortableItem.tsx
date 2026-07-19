import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { useSortable } from '@dnd-kit/react/sortable';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type PageLayoutWidgetDragData } from '@/page-layout/types/PageLayoutWidgetDndData';

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
  disabled?: boolean;
  children: ReactNode;
};

export const PageLayoutWidgetSortableItem = ({
  widgetId,
  tabId,
  index,
  disabled = false,
  children,
}: PageLayoutWidgetSortableItemProps) => {
  const data: PageLayoutWidgetDragData = {
    type: 'widget',
    widgetId,
    tabId,
    index,
  };

  const { ref, handleRef, isDragging } = useSortable({
    id: widgetId,
    index,
    group: tabId,
    data,
    disabled,
    transition: null,
    plugins: PLUGINS_WITHOUT_OPTIMISTIC,
    feedback: 'clone',
  });

  return (
    <StyledSortableRoot
      ref={(element) => {
        ref(element);
        handleRef?.(element);
      }}
      isDragging={isDragging}
    >
      {children}
    </StyledSortableRoot>
  );
};
