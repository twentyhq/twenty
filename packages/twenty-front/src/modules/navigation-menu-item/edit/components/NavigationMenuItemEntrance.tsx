import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  overflow: hidden;
`;

const AnimatedContainer = motion.create(StyledContainer);

type NavigationMenuItemEntranceProps = {
  children: ReactNode;
};

export const NavigationMenuItemEntrance = ({
  children,
}: NavigationMenuItemEntranceProps) => {
  const { theme } = useContext(ThemeContext);
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatedContainer
      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : theme.animation.duration.normal,
      }}
    >
      {children}
    </AnimatedContainer>
  );
};
