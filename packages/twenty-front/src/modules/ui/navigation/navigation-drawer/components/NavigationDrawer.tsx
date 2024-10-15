import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';

import { NAV_DRAWER_WIDTHS } from '@/ui/navigation/navigation-drawer/constants/NavDrawerWidths';

import { isNavigationDrawerExpandedState } from '../../states/isNavigationDrawerExpanded';
import { NavigationDrawerBackButton } from './NavigationDrawerBackButton';
import { NavigationDrawerHeader } from './NavigationDrawerHeader';

export type NavigationDrawerProps = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  isSubMenu?: boolean;
  logo?: string;
  title?: string;
};

const StyledAnimatedContainer = styled(motion.div)``;

const StyledContainer = styled.div<{
  isSubMenu?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${NAV_DRAWER_WIDTHS.menu.desktop.expanded}px;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  padding: ${({ theme, isSubMenu }) =>
    isSubMenu ? theme.spacing(3, 8) : theme.spacing(3, 2, 4)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;
const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
`;

export const NavigationDrawer = ({
  children,
  className,
  footer,
  isSubMenu,
  logo,
  title,
}: NavigationDrawerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const isSettingsPage = useIsSettingsPage();
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
    opacity: isNavigationDrawerExpanded || !isSettingsPage ? 1 : 0,
  };

  return (
    <StyledAnimatedContainer
      className={className}
      initial={false}
      animate={navigationDrawerAnimate}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      <StyledContainer
        isSubMenu={isSubMenu}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
      >
        {isSubMenu && title ? (
          !isMobile && <NavigationDrawerBackButton title={title} />
        ) : (
          <NavigationDrawerHeader
            name={title}
            logo={logo}
            showCollapseButton={isHovered}
          />
        )}
        <StyledItemsContainer>{children}</StyledItemsContainer>
        {footer}
      </StyledContainer>
    </StyledAnimatedContainer>
  );
};
