import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { DESKTOP_NAV_DRAWER_WIDTHS } from '../constants/DesktopNavDrawerWidths';

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
  isNavigationDrawerExpanded: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 100%;
  min-width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? `${DESKTOP_NAV_DRAWER_WIDTHS.menu}px`
      : 'auto'};
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
const StyledItemsContainer = styled.div<{ isSubMenu?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  overflow-y: auto;
  ${({ isSubMenu, theme }) => !isSubMenu && `gap: ${theme.spacing(3)}`}
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

  const desktopWidth = !isNavigationDrawerExpanded
    ? 40
    : DESKTOP_NAV_DRAWER_WIDTHS.menu;

  const mobileWidth = isNavigationDrawerExpanded ? '100%' : 0;

  return (
    <StyledAnimatedContainer
      className={className}
      initial={false}
      animate={{
        width: isMobile ? mobileWidth : desktopWidth,
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      <StyledContainer
        isSubMenu={isSubMenu}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
        isNavigationDrawerExpanded={isNavigationDrawerExpanded}
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
        <StyledItemsContainer isSubMenu={isSubMenu}>
          {children}
        </StyledItemsContainer>
        {footer}
      </StyledContainer>
    </StyledAnimatedContainer>
  );
};
