import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerContent';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';
import { NavigationDrawerBackButton } from './NavigationDrawerBackButton';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
  title: string;
  fixedTopItems?: ReactNode;
  scrollableItems?: ReactNode;
  fixedBottomItems?: ReactNode;
};

const StyledAnimatedContainer = styled(motion.div)`
  max-height: 100vh;
  overflow: hidden;
`;

const StyledContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${({ isSettings }) =>
    isSettings ? '100%' : NAV_DRAWER_WIDTHS.menu.desktop.expanded + 'px'};
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

const StyledFixedContainer = styled.div<{ isSettings?: boolean }>`
  ${({ isSettings, theme }) =>
    isSettings
      ? `
    padding-left: ${theme.spacing(5)};
  `
      : ''}
`;

export const NavigationDrawer = ({
  children,
  className,
  footer,
  title,
  fixedTopItems,
  scrollableItems,
  fixedBottomItems,
}: NavigationDrawerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const theme = useTheme();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const desktopWidth = isNavigationDrawerExpanded
    ? NAV_DRAWER_WIDTHS.menu.desktop.expanded
    : NAV_DRAWER_WIDTHS.menu.desktop.collapsed;

  const mobileWidth = isNavigationDrawerExpanded
    ? NAV_DRAWER_WIDTHS.menu.mobile.expanded
    : NAV_DRAWER_WIDTHS.menu.mobile.collapsed;

  const navigationDrawerAnimate = {
    width: isMobile ? mobileWidth : desktopWidth,
    opacity: isNavigationDrawerExpanded || !isSettingsDrawer ? 1 : 0,
  };

  return (
    <StyledAnimatedContainer
      className={className}
      initial={false}
      animate={navigationDrawerAnimate}
      transition={{ duration: theme.animation.duration.normal }}
    >
      <StyledContainer
        isSettings={isSettingsDrawer}
        isMobile={isMobile}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
      >
        <StyledFixedContainer isSettings={isSettingsDrawer}>
          {isSettingsDrawer && title ? (
            !isMobile && <NavigationDrawerBackButton title={title} />
          ) : (
            <NavigationDrawerHeader showCollapseButton={isHovered} />
          )}
        </StyledFixedContainer>

        <NavigationDrawerContent
          legacyChildren={children}
          isSettingsDrawer={isSettingsDrawer}
          fixedTopItems={fixedTopItems}
          scrollableItems={scrollableItems}
          fixedBottomItems={fixedBottomItems}
        />

        {footer && (
          <StyledFixedContainer isSettings={isSettingsDrawer}>
            <NavigationDrawerSection>{footer}</NavigationDrawerSection>
          </StyledFixedContainer>
        )}
      </StyledContainer>
    </StyledAnimatedContainer>
  );
};
