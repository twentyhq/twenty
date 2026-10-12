import { type RefObject, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  createOnboardingConstructionSiteRenderer,
  type OnboardingConstructionSiteColors,
  type OnboardingConstructionSiteRenderer,
} from '@/onboarding/components/OnboardingConstructionSite/createOnboardingConstructionSiteRenderer';
import { ONBOARDING_CONSTRUCTION_SITE_DEFAULT_SETTINGS } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteDefaultSettings';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';

const readColorChannels = (cssColor: string) => {
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = 1;
  probeCanvas.height = 1;
  const probeContext = probeCanvas.getContext('2d');
  if (!isDefined(probeContext)) {
    return null;
  }
  probeContext.fillStyle = cssColor;
  probeContext.fillRect(0, 0, 1, 1);
  const [red, green, blue] = probeContext.getImageData(0, 0, 1, 1).data;
  return [red / 255, green / 255, blue / 255] as const;
};

const readCanvasColors = (
  canvas: HTMLCanvasElement,
): OnboardingConstructionSiteColors | null => {
  const dashColor = readColorChannels(getComputedStyle(canvas).color);
  return isDefined(dashColor) ? { dashColor } : null;
};

type OnboardingConstructionSiteCanvasEffectProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  stageIndex: number;
  colorScheme: 'light' | 'dark';
  prefersReducedMotion: boolean;
};

export const OnboardingConstructionSiteCanvasEffect = ({
  canvasRef,
  stageIndex,
  colorScheme,
  prefersReducedMotion,
}: OnboardingConstructionSiteCanvasEffectProps) => {
  const [renderer, setRenderer] =
    useState<OnboardingConstructionSiteRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isDefined(canvas) || typeof WebGL2RenderingContext === 'undefined') {
      return;
    }

    const colors = readCanvasColors(canvas);
    if (!isDefined(colors)) {
      return;
    }

    const activeRenderer = createOnboardingConstructionSiteRenderer({
      canvas,
      colors,
      settings: ONBOARDING_CONSTRUCTION_SITE_DEFAULT_SETTINGS,
      contentColumnWidth: ONBOARDING_CONTENT_BLOCK_WIDTH,
      prefersReducedMotion,
    });
    if (!isDefined(activeRenderer)) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => activeRenderer.resize());
    resizeObserver.observe(canvas);
    setRenderer(activeRenderer);

    return () => {
      resizeObserver.disconnect();
      activeRenderer.destroy();
      setRenderer(null);
    };
  }, [canvasRef, prefersReducedMotion]);

  useEffect(() => {
    renderer?.setStage({ stageIndex });
  }, [renderer, stageIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const colors = isDefined(canvas) ? readCanvasColors(canvas) : null;
    if (isDefined(colors)) {
      renderer?.setColors(colors);
    }
  }, [canvasRef, renderer, colorScheme]);

  return null;
};
