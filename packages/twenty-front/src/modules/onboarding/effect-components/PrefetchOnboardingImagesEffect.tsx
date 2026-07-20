import { useEffect } from 'react';

const ONBOARDING_PREFETCH_IMAGE_PATHS = [
  '/images/integrations/twenty-logo.svg',
  '/images/onboarding/trust-badges/pwc.png',
  '/images/onboarding/trust-badges/french-republic.png',
  '/images/onboarding/trust-badges/soc2.png',
  '/images/onboarding/trust-badges/gdpr.png',
];

export const PrefetchOnboardingImagesEffect = () => {
  useEffect(() => {
    for (const imagePath of ONBOARDING_PREFETCH_IMAGE_PATHS) {
      const image = new Image();
      image.src = imagePath;
    }
  }, []);

  return null;
};
