import { type RefObject, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  createOnboardingHomeIllustrationRenderer,
  type OnboardingHomeIllustrationRenderer,
} from '@/onboarding/components/OnboardingHomeIllustration/createOnboardingHomeIllustrationRenderer';
import { ONBOARDING_HOME_ILLUSTRATION_IMAGE_URL } from '@/onboarding/components/OnboardingHomeIllustration/onboardingHomeIllustrationImageUrl';

type OnboardingHomeIllustrationCanvasEffectProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  revealedFurnitureCount: number;
  isFinale: boolean;
};

export const OnboardingHomeIllustrationCanvasEffect = ({
  canvasRef,
  revealedFurnitureCount,
  isFinale,
}: OnboardingHomeIllustrationCanvasEffectProps) => {
  const [renderer, setRenderer] =
    useState<OnboardingHomeIllustrationRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isDefined(canvas)) {
      return;
    }

    let activeRenderer: OnboardingHomeIllustrationRenderer | null = null;
    const resizeObserver = new ResizeObserver(() => activeRenderer?.resize());
    const image = new Image();

    const handleImageLoad = () => {
      activeRenderer = createOnboardingHomeIllustrationRenderer({
        canvas,
        image,
        color: getComputedStyle(canvas)
          .getPropertyValue('--welcome-dot-color')
          .trim(),
        prefersReducedMotion:
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
          false,
      });
      resizeObserver.observe(canvas);
      setRenderer(activeRenderer);
    };

    image.addEventListener('load', handleImageLoad);
    image.crossOrigin = 'anonymous';
    image.src = ONBOARDING_HOME_ILLUSTRATION_IMAGE_URL;

    return () => {
      image.removeEventListener('load', handleImageLoad);
      resizeObserver.disconnect();
      activeRenderer?.destroy();
      setRenderer(null);
    };
  }, [canvasRef]);

  useEffect(() => {
    renderer?.setStage({ revealedFurnitureCount, isFinale });
  }, [renderer, revealedFurnitureCount, isFinale]);

  return null;
};
