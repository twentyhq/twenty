import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

const ONBOARDING_V2_TRANSITION_DURATION_IN_SECONDS = 0.3;

const StyledTransitionContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
`;

const StyledTransitionPage = styled(motion.div)`
  display: flex;
  inset: 0;
  min-height: 0;
  min-width: 0;
  position: absolute;
`;

export const OnboardingV2TransitionOutlet = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();

  return (
    <StyledTransitionContainer>
      <AnimatePresence initial={false}>
        <StyledTransitionPage
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, pointerEvents: 'none' }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: ONBOARDING_V2_TRANSITION_DURATION_IN_SECONDS,
                  ease: 'easeInOut',
                }
          }
        >
          {outlet}
        </StyledTransitionPage>
      </AnimatePresence>
    </StyledTransitionContainer>
  );
};
