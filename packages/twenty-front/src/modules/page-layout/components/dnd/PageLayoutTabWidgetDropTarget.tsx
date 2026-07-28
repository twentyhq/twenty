import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE } from '@/page-layout/constants/PageLayoutTabDropTargetDataAttribute';
import { PAGE_LAYOUT_WIDGET_DND_TYPE } from '@/page-layout/constants/PageLayoutWidgetDndType';
import { pageLayoutGridDragHoveredTabIdComponentState } from '@/page-layout/states/pageLayoutGridDragHoveredTabIdComponentState';
import { type PageLayoutTabWidgetDropData } from '@/page-layout/types/PageLayoutTabWidgetDropData';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledDropTarget = styled.div<{ isActive: boolean }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  outline: ${({ isActive }) =>
    isActive ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
  outline-offset: -1px;
`;

type PageLayoutTabWidgetDropTargetProps = {
  tabId: string;
  children: ReactNode;
};

export const PageLayoutTabWidgetDropTarget = ({
  tabId,
  children,
}: PageLayoutTabWidgetDropTargetProps) => {
  const data: PageLayoutTabWidgetDropData = {
    type: 'tab-widget-drop',
    tabId,
  };

  const { ref, isDropTarget } = useDroppable({
    id: `page-layout-tab-widget-drop-${tabId}`,
    accept: PAGE_LAYOUT_WIDGET_DND_TYPE,
    collisionDetector: pointerIntersection,
    data,
  });

  // Grid drags come from react-grid-layout, outside dnd-kit; their hover
  // highlight is driven by pointer hit-testing instead of isDropTarget.
  const pageLayoutGridDragHoveredTabId = useAtomComponentStateValue(
    pageLayoutGridDragHoveredTabIdComponentState,
  );

  return (
    <StyledDropTarget
      ref={ref}
      isActive={isDropTarget || pageLayoutGridDragHoveredTabId === tabId}
      {...{ [PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE]: tabId }}
    >
      {children}
    </StyledDropTarget>
  );
};
