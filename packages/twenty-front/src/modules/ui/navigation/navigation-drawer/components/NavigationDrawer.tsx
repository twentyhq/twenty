import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

import { useNavigationDrawerExpanded } from '@/ui/navigation/navigation-drawer/hooks/useNavigationDrawerExpanded';
import { isResizablePanelDraggingState } from '@/ui/layout/resizable-panel/states/isResizablePanelDraggingState';
import { ResizablePanelEdge } from '@/ui/layout/resizable-panel/components/ResizablePanelEdge';
import { NAVIGATION_DRAWER_COLLAPSED_WIDTH } from '@/ui/layout/resizable-panel/constants/NavigationDrawerCollapsedWidth';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { NavigationDrawerWidthEffect } from '@/ui/navigation/components/NavigationDrawerWidthEffect';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

export type NavigationDrawerProps = {
  children?: ReactNode;
  className?: string;
  header?: ReactNode;
};

const StyledAnimatedContainer = styled.div<{
  isExpanded: boolean;
  isResizing: boolean;
}>`
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  position: relative;
  transition: ${({ isResizing }) =>
    isResizing
      ? 'none'
      : `width calc(${themeCssVariables.animation.duration.normal} * 1s)`};
  width: ${({ isExpanded }) =>
    isExpanded
      ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})`
      : `${NAVIGATION_DRAWER_COLLAPSED_WIDTH}px`};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${({ isExpanded }) =>
      isExpanded ? 'calc(100vw / var(--t-zoom, 1))' : '0'};
  }
`;

const StyledContainer = styled.div<{
  isExpanded?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: ${themeCssVariables.spacing[4]};
  width: ${({ isExpanded }) =>
    isExpanded ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})` : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  padding-left: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[4]};
    padding-right: ${themeCssVariables.spacing[2]};
  }
`;

export const NavigationDrawer = ({
  children,
  className,
  header,
}: NavigationDrawerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const isMobile = useIsMobile();
  const isExpanded = useNavigationDrawerExpanded();

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const [navigationDrawerWidth, setNavigationDrawerWidth] = useAtomState(
    navigationDrawerWidthState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const setIsResizablePanelDragging = useSetAtomState(
    isResizablePanelDraggingState,
  );

  const handleCollapse = () => {
    setIsNavigationDrawerExpanded(false);
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setIsResizing(false);
    setIsResizablePanelDragging(false);
  };

  const handleWidthChange = (width: number) => {
    setNavigationDrawerWidth(width);
    setIsResizing(false);
    setIsResizablePanelDragging(false);
  };

  const handleResizeStart = (_size: number) => {
    setIsResizing(true);
    setIsResizablePanelDragging(true);
  };

  return (
    <>
      <NavigationDrawerWidthEffect />
      <StyledAnimatedContainer
        className={className}
        data-click-outside-id={NAVIGATION_DRAWER_CLICK_OUTSIDE_ID}
        isExpanded={isExpanded}
        isResizing={isResizing}
      >
        <StyledContainer isExpanded={isExpanded}>
          {header}
          <StyledContent>{children}</StyledContent>
        </StyledContainer>

        {isNavigationDrawerExpanded && !isMobile && (
          <ResizablePanelEdge
            side="right"
            constraints={NAVIGATION_DRAWER_CONSTRAINTS}
            currentSize={navigationDrawerWidth}
            onSizeChange={handleWidthChange}
            onCollapse={handleCollapse}
            showHandle={false}
            cssVariableName={NAVIGATION_DRAWER_WIDTH_VAR}
            onResizeStart={handleResizeStart}
          />
        )}
      </StyledAnimatedContainer>
    </>
  );
};
