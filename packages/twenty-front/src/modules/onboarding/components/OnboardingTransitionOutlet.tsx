import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

export const OnboardingTransitionOutlet = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();
  const transition = useOnboardingMotionTransition();

  return (
    <StyledTransitionContainer>
      <AnimatePresence>
        <StyledTransitionPage
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -ONBOARDING_MOTION_SLIDE_OFFSET,
            pointerEvents: 'none',
          }}
          transition={transition}
        >
          {outlet}
        </StyledTransitionPage>
      </AnimatePresence>
    </StyledTransitionContainer>
  );
};
