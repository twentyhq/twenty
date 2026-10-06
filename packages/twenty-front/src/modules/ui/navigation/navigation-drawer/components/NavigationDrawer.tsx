import { styled } from '@linaria/react';
import { type ReactNode, useRef, useState } from 'react';

import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { PanelResizeHandle } from 'twenty-ui/components/layout';
import { useLingui } from '@lingui/react/macro';
import { getUiZoom } from '@/ui/theme/utils/getUiZoom';
import { NAVIGATION_DRAWER_COLLAPSED_WIDTH } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedWidth';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { NavigationDrawerWidthEffect } from '@/ui/navigation/components/NavigationDrawerWidthEffect';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import {
  NAVIGATION_DRAWER_WIDTH_VAR,
  navigationDrawerWidthState,
} from '@/ui/navigation/states/navigationDrawerWidthState';
import { shouldFocusNavigationDrawerExpandButtonState } from '@/ui/navigation/navigation-drawer/states/shouldFocusNavigationDrawerExpandButtonState';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
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
  overflow: clip;
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
}: NavigationDrawerProps) => {
  const { t } = useLingui();
  const resizeHandleRef = useRef<HTMLDivElement>(null);
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
  const setTableWidthResizeIsActive = useSetAtomState(
    tableWidthResizeIsActiveState,
  );
  const setShouldFocusNavigationDrawerExpandButton = useSetAtomState(
    shouldFocusNavigationDrawerExpandButtonState,
  );

  const handleCollapse = () => {
    setShouldFocusNavigationDrawerExpandButton(
      resizeHandleRef.current === document.activeElement,
    );
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

  const handleWidthPreview = (width: number) => {
    document.documentElement.style.setProperty(
      NAVIGATION_DRAWER_WIDTH_VAR,
      `${width}px`,
    );
  };

  const handleResizeEnd = () => {
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
          <NavigationDrawerHeader />
          <StyledContent>{children}</StyledContent>
        </StyledContainer>

        {isNavigationDrawerExpanded && !isMobile && (
          <PanelResizeHandle
            ref={resizeHandleRef}
            edge="right"
            minSize={NAVIGATION_DRAWER_CONSTRAINTS.min}
            maxSize={NAVIGATION_DRAWER_CONSTRAINTS.max}
            size={navigationDrawerWidth}
            onSizePreview={handleWidthPreview}
            onSizeCommitted={handleWidthChange}
            onActivate={handleCollapse}
            showGrip={false}
            aria-label={t`Resize navigation drawer`}
            scale={getUiZoom}
            onResizeEnd={handleResizeEnd}
            onResizeStart={handleResizeStart}
          />
        )}
      </StyledAnimatedContainer>
    </>
  );
};
