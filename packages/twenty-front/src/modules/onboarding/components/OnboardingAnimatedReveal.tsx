import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

const StyledAnimatedRevealBase = styled.div`
  max-width: 100%;
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
  const shouldReduceMotion = useReducedMotion();
  const slideOffset = shouldReduceMotion ? 0 : ONBOARDING_MOTION_SLIDE_OFFSET;

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <StyledAnimatedReveal
          className={className}
          initial={{ opacity: 0, y: slideOffset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: slideOffset }}
          transition={transition}
        >
          {children}
        </StyledAnimatedReveal>
      )}
    </AnimatePresence>
  );
};
