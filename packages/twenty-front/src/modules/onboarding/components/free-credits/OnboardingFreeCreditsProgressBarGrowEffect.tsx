import { type RefObject, useEffect, useEffectEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

const TRACK_GROWTH_EVENT_NAME = 'animationend';
const REDUCED_MOTION_CHANGE_EVENT_NAME = 'change';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MILLISECONDS_IN_SECOND = 1000;

type OnboardingFreeCreditsProgressBarGrowEffectProps = {
  progressBarRef: RefObject<HTMLDivElement | null>;
  hasTrackGrown: boolean;
  onTrackGrown: () => void;
};

export const OnboardingFreeCreditsProgressBarGrowEffect = ({
  progressBarRef,
  hasTrackGrown,
  onTrackGrown,
}: OnboardingFreeCreditsProgressBarGrowEffectProps) => {
  const theme = useTheme();
  const [hasCompletedGrowth, setHasCompletedGrowth] = useState(false);
  const notifyTrackGrown = useEffectEvent(onTrackGrown);

  useEffect(() => {
    if (hasCompletedGrowth) {
      notifyTrackGrown();
    }
  }, [hasCompletedGrowth]);

  useEffect(() => {
    const progressBar = progressBarRef.current;

    if (hasTrackGrown || hasCompletedGrowth || !isDefined(progressBar)) {
      return;
    }

    let hasFinishedGrowth = false;

    const completeTrackGrowth = () => {
      if (hasFinishedGrowth) {
        return;
      }

      hasFinishedGrowth = true;
      setHasCompletedGrowth(true);
    };

    const reducedMotionMedia = isDefined(window.matchMedia)
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : undefined;

    if (reducedMotionMedia?.matches === true) {
      completeTrackGrowth();
      return;
    }

    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.target === progressBar) {
        completeTrackGrowth();
      }
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        completeTrackGrowth();
      }
    };

    const growthTimeoutId = setTimeout(
      completeTrackGrowth,
      theme.animation.duration.normal * MILLISECONDS_IN_SECOND,
    );

    progressBar.addEventListener(TRACK_GROWTH_EVENT_NAME, handleAnimationEnd);
    reducedMotionMedia?.addEventListener(
      REDUCED_MOTION_CHANGE_EVENT_NAME,
      handleReducedMotionChange,
    );

    return () => {
      hasFinishedGrowth = true;
      clearTimeout(growthTimeoutId);
      progressBar.removeEventListener(
        TRACK_GROWTH_EVENT_NAME,
        handleAnimationEnd,
      );
      reducedMotionMedia?.removeEventListener(
        REDUCED_MOTION_CHANGE_EVENT_NAME,
        handleReducedMotionChange,
      );
    };
  }, [
    hasTrackGrown,
    hasCompletedGrowth,
    progressBarRef,
    theme.animation.duration.normal,
  ]);

  return null;
};
