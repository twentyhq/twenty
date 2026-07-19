import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { pageLayoutWidgetDragOverTabIdComponentState } from '@/page-layout/states/pageLayoutWidgetDragOverTabIdComponentState';
import { type PageLayoutTabWidgetDropData } from '@/page-layout/types/PageLayoutWidgetDndData';
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
  disabled?: boolean;
  children: ReactNode;
};

export const PageLayoutTabWidgetDropTarget = ({
  tabId,
  disabled = false,
  children,
}: PageLayoutTabWidgetDropTargetProps) => {
  const data: PageLayoutTabWidgetDropData = {
    type: 'tab-widget-drop',
    tabId,
  };

  const { ref } = useDroppable({
    id: `page-layout-tab-widget-drop-${tabId}`,
    disabled,
    collisionDetector: pointerIntersection,
    data,
  });

  const pageLayoutWidgetDragOverTabId = useAtomComponentStateValue(
    pageLayoutWidgetDragOverTabIdComponentState,
  );

  return (
    <StyledDropTarget
      ref={ref}
      isActive={pageLayoutWidgetDragOverTabId === tabId}
    >
      {children}
    </StyledDropTarget>
  );
};
