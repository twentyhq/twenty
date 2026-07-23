import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type PageLayoutTabWidgetDropData } from '@/page-layout/types/PageLayoutWidgetDndData';

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
    collisionDetector: pointerIntersection,
    data,
  });

  return (
    <StyledDropTarget ref={ref} isActive={isDropTarget}>
      {children}
    </StyledDropTarget>
  );
};
