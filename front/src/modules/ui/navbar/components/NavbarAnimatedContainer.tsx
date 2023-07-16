import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIsSubNavbarDisplayed } from '@/ui/layout/hooks/useIsSubNavbarDisplayed';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { MOBILE_VIEWPORT } from '@/ui/themes/themes';

const StyledNavbarContainer = styled(motion.div)`
  align-items: end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${(props) =>
      useRecoilValue(isNavbarOpenedState)
        ? `calc(100% - ` + props.theme.spacing(4) + `)`
        : '0'};
  }
`;

type NavbarProps = {
  children: React.ReactNode;
  layout?: string;
};

export function NavbarAnimatedContainer({ children, layout }: NavbarProps) {
  const isMenuOpened = useRecoilValue(isNavbarOpenedState);
  const [, setIsNavbarSwitchingSize] = useRecoilState(
    isNavbarSwitchingSizeState,
  );
  const isSubNavbarDisplayed = useIsSubNavbarDisplayed();
  const theme = useTheme();

  return (
    <StyledNavbarContainer
      onAnimationComplete={() => {
        setIsNavbarSwitchingSize(false);
      }}
      animate={{
        width: isMenuOpened ? (isSubNavbarDisplayed ? '520px' : '220px') : '0',
        opacity: isMenuOpened ? 1 : 0,
      }}
      transition={{
        duration: theme.animation.duration.visible,
      }}
    >
      {children}
    </StyledNavbarContainer>
  );
}
