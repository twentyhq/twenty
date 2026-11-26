import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTheme } from 'twenty-ui/theme';

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
  const theme = useTheme();
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
