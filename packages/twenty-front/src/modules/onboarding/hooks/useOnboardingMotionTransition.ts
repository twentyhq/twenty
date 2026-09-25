import { type Transition, useReducedMotion } from 'framer-motion';
import { useTheme } from 'twenty-ui/theme';

export const useOnboardingMotionTransition = (): Transition => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return shouldReduceMotion
    ? { duration: 0 }
    : { duration: theme.animation.duration.normal, ease: 'easeInOut' };
};
