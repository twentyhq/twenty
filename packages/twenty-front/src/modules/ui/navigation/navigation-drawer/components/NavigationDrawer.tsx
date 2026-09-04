import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
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
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children?: ReactNode;
  className?: string;
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

// The header takes a tighter gap than the sections below it so that the mode
// switcher row starts where the page card header ends in the next column.
const StyledContainer = styled.div<{
  isExpanded?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  padding: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
  width: ${({ isExpanded }) =>
    isExpanded ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})` : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-left: ${themeCssVariables.spacing[2]};
    padding-right: ${themeCssVariables.spacing[2]};
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[4]};
  }
`;

export const NavigationDrawer = ({
  children,
  className,
}: NavigationDrawerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isExpanded = useNavigationDrawerExpanded();

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const [navigationDrawerWidth, setNavigationDrawerWidth] = useAtomState(
    navigationDrawerWidthState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const setTableWidthResizeIsActive = useSetAtomState(
    tableWidthResizeIsActiveState,
  );

  const handleCollapse = () => {
    setIsNavigationDrawerExpanded(false);
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  };

  const handleWidthChange = (width: number) => {
    setNavigationDrawerWidth(width);
    setIsResizing(false);
    setTableWidthResizeIsActive(true);
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    setTableWidthResizeIsActive(false);
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
          <NavigationDrawerHeader
            showCollapseButton={isMobile || !isSettingsDrawer}
          />
          <StyledContent>{children}</StyledContent>
        </StyledContainer>

        {isNavigationDrawerExpanded && !isMobile && !isSettingsDrawer && (
          <ResizablePanelEdge
            side="right"
            constraints={NAVIGATION_DRAWER_CONSTRAINTS}
            currentWidth={navigationDrawerWidth}
            onWidthChange={handleWidthChange}
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
