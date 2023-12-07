import { ReactNode, useState } from 'react';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';

import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { desktopNavDrawerWidths } from '../constants';

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

const StyledContainer = styled.div<{ isSubMenu?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  height: 100%;
  min-width: ${desktopNavDrawerWidths.menu};
  padding: ${({ theme }) => theme.spacing(3, 2, 4)};

  ${({ isSubMenu, theme }) =>
    isSubMenu
      ? css`
          padding-right: ${theme.spacing(8)};
          padding-top: 41px;
        `
      : ''}

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
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
  const theme = useTheme();
  const isNavigationDrawerOpen = useRecoilValue(isNavigationDrawerOpenState);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const desktopWidth = !isNavigationDrawerOpen
    ? 12
    : isSubMenu
      ? desktopNavDrawerWidths.submenu
      : desktopNavDrawerWidths.menu;

  const mobileWidth = isNavigationDrawerOpen ? '100%' : 0;

  return (
    <StyledAnimatedContainer
      className={className}
      initial={false}
      animate={{
        width: isMobile ? mobileWidth : desktopWidth,
        opacity: isNavigationDrawerOpen ? 1 : 0,
      }}
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
