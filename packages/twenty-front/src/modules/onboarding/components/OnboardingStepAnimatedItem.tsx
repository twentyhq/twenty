import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { ONBOARDING_MOTION_STAGGER_DELAY } from '@/onboarding/constants/OnboardingMotionStaggerDelay';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledAnimatedItemBase = styled.div`
  max-width: 100%;

  &[data-filling-remaining-space='true'] {
    display: flex;
    flex: 1;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
    width: 100%;
  }
`;

const StyledAnimatedItem = motion.create(StyledAnimatedItemBase);

type OnboardingStepAnimatedItemProps = {
  index: number;
  children: ReactNode;
  isFillingRemainingSpace?: boolean;
};

export const OnboardingStepAnimatedItem = ({
  index,
  children,
  isFillingRemainingSpace = false,
}: OnboardingStepAnimatedItemProps) => {
  const transition = useOnboardingMotionTransition();
  const shouldReduceMotion = useReducedMotion();
  const onboardingNavigationDirection = useAtomStateValue(
    onboardingNavigationDirectionState,
  );

  const directionalEnterSlideOffset =
    onboardingNavigationDirection === 'backward'
      ? -ONBOARDING_MOTION_SLIDE_OFFSET
      : ONBOARDING_MOTION_SLIDE_OFFSET;

  return (
    <StyledAnimatedItem
      data-filling-remaining-space={isFillingRemainingSpace}
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : directionalEnterSlideOffset,
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
