import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIsInSubMenu } from '@/ui/layout/hooks/useIsInSubMenu';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';

import { useIsMobile } from '../../../../hooks/useIsMobile';

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

export function NavbarAnimatedContainer({ children }: NavbarProps) {
  const isMenuOpened = useRecoilValue(isNavbarOpenedState);
  const [, setIsNavbarSwitchingSize] = useRecoilState(
    isNavbarSwitchingSizeState,
  );
  const isInSubMenu = useIsInSubMenu();
  const theme = useTheme();

  const isMobile = useIsMobile();

  const leftBarWidth = isInSubMenu
    ? isMobile
      ? theme.leftSubMenuNavBarWidth.mobile
      : theme.leftSubMenuNavBarWidth.desktop
    : isMobile
    ? theme.leftNavBarWidth.mobile
    : theme.leftNavBarWidth.desktop;

  return (
    <StyledNavbarContainer
      onAnimationComplete={() => {
        setIsNavbarSwitchingSize(false);
      }}
      animate={{
        width: isMenuOpened ? leftBarWidth : '0',
        opacity: isMenuOpened ? 1 : 0,
      }}
      transition={{
        duration: theme.animation.duration.normal,
      }}
    >
      {children}
    </StyledNavbarContainer>
  );
}
