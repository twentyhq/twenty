import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { onboardingNavigationDirectionState } from '@/onboarding/states/onboardingNavigationDirectionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

const StyledTransitionContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
`;

const StyledTransitionPage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  inset: 0;
  min-height: 0;
  min-width: 0;
  position: absolute;
`;

const transitionPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: (exitSlideOffset: number) => ({
    opacity: 0,
    y: exitSlideOffset,
    pointerEvents: 'none',
  }),
};

export const OnboardingTransitionOutlet = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();
  const transition = useOnboardingMotionTransition();
  const onboardingNavigationDirection = useAtomStateValue(
    onboardingNavigationDirectionState,
  );

  const exitSlideOffset =
    onboardingNavigationDirection === 'backward'
      ? ONBOARDING_MOTION_SLIDE_OFFSET
      : -ONBOARDING_MOTION_SLIDE_OFFSET;

  const exitCustom = shouldReduceMotion ? 0 : exitSlideOffset;

  return (
    <StyledTransitionContainer>
      <AnimatePresence custom={exitCustom}>
        <StyledTransitionPage
          key={pathname}
          custom={exitCustom}
          variants={transitionPageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
        >
          {outlet}
        </StyledTransitionPage>
      </AnimatePresence>
    </StyledTransitionContainer>
  );
};
