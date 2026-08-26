import { type Draggable } from '@dnd-kit/abstract';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode, useCallback } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE } from '@/page-layout/constants/PageLayoutTabDropTargetDataAttribute';
import { pageLayoutGridDragHoveredTabIdComponentState } from '@/page-layout/states/pageLayoutGridDragHoveredTabIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutTabWidgetDropData } from '@/page-layout/types/PageLayoutTabWidgetDropData';
import { canVerticalListAcceptWidgetDrag } from '@/page-layout/utils/canVerticalListAcceptWidgetDrag';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledDropTarget = styled.div<{ isActive: boolean }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  outline: ${({ isActive }) =>
    isActive ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
  outline-offset: -1px;
  z-index: ${({ isActive }) => (isActive ? 1 : 'auto')};
  &[data-widget-hover] [data-active]::after {
    background-color: transparent;
  }
`;

type PageLayoutTabWidgetDropTargetProps = {
  tabId: string;
  destinationWidgets: PageLayoutWidget[];
  children: ReactNode;
};

export const PageLayoutTabWidgetDropTarget = ({
  tabId,
  destinationWidgets,
  children,
}: PageLayoutTabWidgetDropTargetProps) => {
  const data: PageLayoutTabWidgetDropData = {
    type: 'tab-widget-drop',
    tabId,
  };

  const canAcceptWidgetDrag = useCallback(
    (source: Draggable) =>
      canVerticalListAcceptWidgetDrag({ destinationWidgets, source }),
    [destinationWidgets],
  );

  const { ref, isDropTarget } = useDroppable({
    id: `page-layout-tab-widget-drop-${tabId}`,
    accept: canAcceptWidgetDrag,
    collisionDetector: pointerIntersection,
    data,
  });

  // Grid drags come from react-grid-layout, outside dnd-kit; their hover
  // highlight is driven by pointer hit-testing instead of isDropTarget.
  const pageLayoutGridDragHoveredTabId = useAtomComponentStateValue(
    pageLayoutGridDragHoveredTabIdComponentState,
  );

  const isActive = isDropTarget || pageLayoutGridDragHoveredTabId === tabId;

  return (
    <StyledDropTarget
      ref={ref}
      isActive={isActive}
      data-widget-hover={isActive || undefined}
      {...{ [PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE]: tabId }}
    >
      {children}
    </StyledDropTarget>
  );
};
