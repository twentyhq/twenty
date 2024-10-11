import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { DESKTOP_NAV_DRAWER_WIDTHS } from '../constants/DesktopNavDrawerWidths';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
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

const StyledAnimatedContainer = styled(motion.div)`
  display: flex;
  justify-content: end;
`;

const StyledContainer = styled.div<{
  isSubMenu?: boolean;
  isExpanded: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  min-width: ${({ isExpanded }) =>
    isExpanded ? `${DESKTOP_NAV_DRAWER_WIDTHS.menu}px` : 'auto'};
  padding: ${({ theme }) => theme.spacing(3, 2, 4)};

  ${({ isSubMenu, theme }) =>
    isSubMenu
      ? css`
          padding-left: ${theme.spacing(0)};
          padding-right: ${theme.spacing(8)};
        `
      : ''}

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
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  const isSettingsPage = useIsSettingsPage();

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const desktopWidth = !isNavigationDrawerExpanded
    ? 42
    : DESKTOP_NAV_DRAWER_WIDTHS.menu;

  const mobileWidth = isNavigationDrawerExpanded ? '100%' : 0;

  return (
    /*<StyledAnimatedContainer
      className={className}
      initial={false}
      animate={{
        width: isMobile ? mobileWidth : 'auto',
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >*/
    <StyledContainer
      isSubMenu={isSubMenu}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      isExpanded={isNavigationDrawerExpanded || isSettingsPage}
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
    /*</StyledAnimatedContainer>*/
  );
};
