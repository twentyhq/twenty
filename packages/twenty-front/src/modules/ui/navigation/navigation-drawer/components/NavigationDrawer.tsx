import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';
import { NavigationDrawerBackButton } from './NavigationDrawerBackButton';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  logo?: string;
  title: string;
};

const StyledAnimatedContainer = styled(motion.div)<{ isSettings?: boolean }>`
  max-height: 100vh;
  overflow: ${({ isSettings }) => (isSettings ? 'visible' : 'hidden')};
`;

const StyledContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${NAV_DRAWER_WIDTHS.menu.desktop.expanded}px;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  padding: ${({ theme, isSettings, isMobile }) =>
    isSettings
      ? isMobile
        ? theme.spacing(3, 8)
        : theme.spacing(3, 8, 4, 0)
      : theme.spacing(3, 2, 4)};
  padding-right: 0px;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }
`;

const StyledItemsContainer = styled.div<{ isSettings?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  overflow: ${({ isSettings }) => (isSettings ? 'visible' : 'hidden')};
  flex: 1;
`;

export const NavigationDrawer = ({
  children,
  className,
  footer,
  logo,
  title,
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
      isSettings={isSettingsDrawer}
    >
      <StyledContainer
        isSettings={isSettingsDrawer}
        isMobile={isMobile}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
      >
        {isSettingsDrawer && title ? (
          !isMobile && <NavigationDrawerBackButton title={title} />
        ) : (
          <NavigationDrawerHeader
            name={title}
            logo={logo || ''}
            showCollapseButton={isHovered}
          />
        )}
        <StyledItemsContainer isSettings={isSettingsDrawer}>
          {children}
        </StyledItemsContainer>
        <NavigationDrawerSection>{footer}</NavigationDrawerSection>
      </StyledContainer>
    </StyledAnimatedContainer>
  );
};
