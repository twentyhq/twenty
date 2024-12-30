import { useExpandedAnimation } from '@/settings/hooks/useExpandedAnimation';
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
  const { contentRef, motionAnimationVariants } = useExpandedAnimation(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <StyledAnimatedContainer
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
        >
          {children}
        </StyledAnimatedContainer>
      )}
    </AnimatePresence>
  );
};
