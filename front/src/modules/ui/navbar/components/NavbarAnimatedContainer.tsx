import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { leftNavbarWidth, leftSubMenuNavbarWidth } from '../constants';

const StyledNavbarContainer = styled(motion.div)`
  align-items: end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
`;

type NavbarProps = {
  children: React.ReactNode;
};

export const NavbarAnimatedContainer = ({ children }: NavbarProps) => {
  const isNavbarOpened = useRecoilValue(isNavbarOpenedState);
  const [, setIsNavbarSwitchingSize] = useRecoilState(
    isNavbarSwitchingSizeState,
  );
  const isInSubMenu = useIsSubMenuNavbarDisplayed();
  const theme = useTheme();

  const isMobile = useIsMobile();

  const leftBarWidth = isInSubMenu
    ? isMobile
      ? leftSubMenuNavbarWidth.mobile
      : leftSubMenuNavbarWidth.desktop
    : isMobile
    ? leftNavbarWidth.mobile
    : leftNavbarWidth.desktop;

  return (
    <StyledNavbarContainer
      onAnimationComplete={() => {
        setIsNavbarSwitchingSize(false);
      }}
      animate={{
        width: isNavbarOpened ? leftBarWidth : '0',
        opacity: isNavbarOpened ? 1 : 0,
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledNavbarContainer>
  );
};
