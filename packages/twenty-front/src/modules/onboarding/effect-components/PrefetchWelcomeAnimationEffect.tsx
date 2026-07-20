import { useEffect } from 'react';

import { prewarmWelcomeHalftoneWorker } from '@/onboarding/components/WelcomeOverlay/prewarmWelcomeHalftoneWorker';

export const PrefetchWelcomeAnimationEffect = () => {
  useEffect(() => prewarmWelcomeHalftoneWorker(), []);

  return null;
};
