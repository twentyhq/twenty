import { usePreloadCalForBookCallStep } from '@/onboarding/hooks/usePreloadCalForBookCallStep';

export const PrefetchBookCallStepEffect = () => {
  usePreloadCalForBookCallStep();

  return null;
};
