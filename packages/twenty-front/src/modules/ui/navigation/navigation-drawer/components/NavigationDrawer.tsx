import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';

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
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { NavigationDrawerBackButton } from './NavigationDrawerBackButton';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children?: ReactNode;
  className?: string;
  title: string;
};

const StyledAnimatedContainer = styled.div<{
  isExpanded: boolean;
  isResizing: boolean;
}>`
  max-height: 100vh;
  overflow: hidden;
  position: relative;
  width: ${({ isExpanded }) =>
    isExpanded
      ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})`
      : `${NAVIGATION_DRAWER_COLLAPSED_WIDTH}px`};
  transition: ${({ isResizing, theme }) =>
    isResizing ? 'none' : `width ${theme.animation.duration.normal}s`};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${({ isExpanded }) => (isExpanded ? '100%' : '0')};
  }
`;

const StyledContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
  isExpanded?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${({ isExpanded }) =>
    isExpanded ? `var(${NAVIGATION_DRAWER_WIDTH_VAR})` : '100%'};
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  padding: ${({ theme, isSettings, isMobile }) =>
    isSettings
      ? isMobile
        ? theme.spacing(3, 0, 0, 8)
        : theme.spacing(3, 0, 4, 0)
      : theme.spacing(3, 0, 4, 2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-left: ${({ theme }) => theme.spacing(5)};
    padding-right: ${({ theme }) => theme.spacing(5)};
  }
`;

export const NavigationDrawer = ({
  children,
  className,
  title,
}: NavigationDrawerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();

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
        isExpanded={isNavigationDrawerExpanded}
        isResizing={isResizing}
      >
        <StyledContainer
          isSettings={isSettingsDrawer}
          isMobile={isMobile}
          isExpanded={isNavigationDrawerExpanded}
        >
          {isSettingsDrawer && title ? (
            !isMobile && <NavigationDrawerBackButton title={title} />
          ) : (
            <NavigationDrawerHeader showCollapseButton />
          )}
          {children}
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
