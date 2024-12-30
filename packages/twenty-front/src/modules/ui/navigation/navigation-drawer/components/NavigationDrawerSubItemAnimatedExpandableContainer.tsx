import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

const StyledAnimatedContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

type NavigationDrawerSubItemAnimatedExpandableContainerProps = {
  children: ReactNode;
  isOpen?: boolean;
};

export const NavigationDrawerSubItemAnimatedExpandableContainer = ({
  children,
  isOpen = false,
}: NavigationDrawerSubItemAnimatedExpandableContainerProps) => {
  const theme = useTheme();

  return (
    <AnimatePresence mode="wait">
      <StyledAnimatedContainer
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        initial={false}
        transition={{
          duration: theme.animation.duration.normal,
          ease: 'easeInOut',
        }}
      >
        {children}
      </StyledAnimatedContainer>
    </AnimatePresence>
  );
};
