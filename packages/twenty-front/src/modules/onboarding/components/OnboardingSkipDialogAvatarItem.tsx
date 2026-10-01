import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

const StyledItem = styled(motion.div)`
  display: flex;
`;

type OnboardingSkipDialogAvatarItemProps = {
  index: number;
  children: ReactNode;
};

export const OnboardingSkipDialogAvatarItem = ({
  index,
  children,
}: OnboardingSkipDialogAvatarItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <StyledItem
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 22,
        delay: index * 0.05,
      }}
    >
      {children}
    </StyledItem>
  );
};
