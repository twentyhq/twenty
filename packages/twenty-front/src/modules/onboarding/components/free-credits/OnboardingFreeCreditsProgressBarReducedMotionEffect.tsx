import { useEffect } from 'react';
import { useMediaQuery } from 'twenty-ui/utilities';

// oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a CSS value or browser media query, not UI copy.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type OnboardingFreeCreditsProgressBarReducedMotionEffectProps = {
  hasTrackGrown: boolean;
  onTrackGrown: () => void;
};

export const OnboardingFreeCreditsProgressBarReducedMotionEffect = ({
  hasTrackGrown,
  onTrackGrown,
}: OnboardingFreeCreditsProgressBarReducedMotionEffectProps) => {
  const shouldReduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    if (hasTrackGrown || !shouldReduceMotion) {
      return;
    }

    onTrackGrown();
  }, [hasTrackGrown, onTrackGrown, shouldReduceMotion]);

  return null;
};
