import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode } from 'react';

const StyledAnimatedRevealBase = styled.div`
  max-width: 100%;
  overflow: hidden;
`;

const StyledAnimatedReveal = motion.create(StyledAnimatedRevealBase);

type OnboardingAnimatedRevealProps = {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
};

export const OnboardingAnimatedReveal = ({
  isVisible,
  children,
  className,
}: OnboardingAnimatedRevealProps) => {
  const transition = useOnboardingMotionTransition();

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <StyledAnimatedReveal
          className={className}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={transition}
        >
          {children}
        </StyledAnimatedReveal>
      )}
    </AnimatePresence>
  );
};
