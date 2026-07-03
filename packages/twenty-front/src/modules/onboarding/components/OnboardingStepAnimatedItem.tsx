import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { ONBOARDING_MOTION_STAGGER_DELAY } from '@/onboarding/constants/OnboardingMotionStaggerDelay';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';

const StyledAnimatedItemBase = styled.div`
  max-width: 100%;
`;

const StyledAnimatedItem = motion.create(StyledAnimatedItemBase);

type OnboardingStepAnimatedItemProps = {
  index: number;
  children: ReactNode;
  className?: string;
};

export const OnboardingStepAnimatedItem = ({
  index,
  children,
  className,
}: OnboardingStepAnimatedItemProps) => {
  const transition = useOnboardingMotionTransition();
  const shouldReduceMotion = useReducedMotion();

  return (
    <StyledAnimatedItem
      className={className}
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : ONBOARDING_MOTION_SLIDE_OFFSET,
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...transition,
        delay: shouldReduceMotion ? 0 : index * ONBOARDING_MOTION_STAGGER_DELAY,
      }}
    >
      {children}
    </StyledAnimatedItem>
  );
};
