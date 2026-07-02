import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTransitionContainer>
      <AnimatePresence initial={false}>
        <StyledTransitionPage
          key={pathname}
          initial={{ opacity: 0, y: theme.spacingMultiplicator }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: -theme.spacingMultiplicator,
            pointerEvents: 'none',
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: theme.animation.duration.normal,
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
