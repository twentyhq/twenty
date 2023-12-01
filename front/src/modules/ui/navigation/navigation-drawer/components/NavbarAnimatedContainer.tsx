import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { navigationDrawerState } from '@/ui/layout/states/navigationDrawerState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { desktopNavDrawerWidths } from '../constants';

const StyledNavbarContainer = styled(motion.div)`
  align-items: end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
`;

type NavbarAnimatedContainerProps = {
  children: ReactNode;
};

export const NavbarAnimatedContainer = ({
  children,
}: NavbarAnimatedContainerProps) => {
  const navigationDrawer = useRecoilValue(navigationDrawerState);
  const setIsNavbarSwitchingSize = useSetRecoilState(
    isNavbarSwitchingSizeState,
  );
  const isInSubMenu = useIsSettingsPage();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const desktopWidth =
    navigationDrawer === ''
      ? 12
      : isInSubMenu
      ? desktopNavDrawerWidths.submenu
      : desktopNavDrawerWidths.menu;

  return (
    <StyledNavbarContainer
      initial={false}
      onAnimationComplete={() => setIsNavbarSwitchingSize(false)}
      animate={{
        width: !isMobile ? desktopWidth : navigationDrawer ? '100%' : 0,
        opacity: navigationDrawer === '' ? 0 : 1,
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledNavbarContainer>
  );
};
