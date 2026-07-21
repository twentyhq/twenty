import { isDefined } from 'twenty-shared/utils';

import { WELCOME_HALFTONE_DASHES } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';
import { type WelcomeHalftoneController } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneController.type';
import { createWelcomeHalftoneRenderer } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneRenderer';

type CreateWelcomeHalftoneMainThreadControllerOptions = {
  canvas: HTMLCanvasElement;
  dotColor: string;
  dotHighlightColor: string;
  prefersReducedMotion: boolean;
  initialCanvasWidth: number;
  initialCanvasHeight: number;
  devicePixelRatio: number;
};

export const createWelcomeHalftoneMainThreadController = ({
  canvas,
  dotColor,
  dotHighlightColor,
  prefersReducedMotion,
  initialCanvasWidth,
  initialCanvasHeight,
  devicePixelRatio,
}: CreateWelcomeHalftoneMainThreadControllerOptions): WelcomeHalftoneController | null => {
  let renderingContext: CanvasRenderingContext2D | null = null;
  try {
    renderingContext = canvas.getContext('2d');
  } catch {
    renderingContext = null;
  }
  if (!isDefined(renderingContext)) {
    return null;
  }

  const applyBackingStoreSize = (
    canvasWidth: number,
    canvasHeight: number,
    activeDevicePixelRatio: number,
  ) => {
    canvas.width = Math.round(canvasWidth * activeDevicePixelRatio);
    canvas.height = Math.round(canvasHeight * activeDevicePixelRatio);
  };

  applyBackingStoreSize(
    initialCanvasWidth,
    initialCanvasHeight,
    devicePixelRatio,
  );
  const renderer = createWelcomeHalftoneRenderer({
    context: renderingContext,
    dashes: WELCOME_HALFTONE_DASHES,
    width: initialCanvasWidth,
    height: initialCanvasHeight,
    devicePixelRatio,
    color: dotColor,
    highlightColor: dotHighlightColor,
    reducedMotion: prefersReducedMotion,
  });

  return {
    leave: () => renderer.leave(),
    resize: (nextCanvasWidth, nextCanvasHeight, nextDevicePixelRatio) => {
      applyBackingStoreSize(
        nextCanvasWidth,
        nextCanvasHeight,
        nextDevicePixelRatio,
      );
      renderer.resize(nextCanvasWidth, nextCanvasHeight, nextDevicePixelRatio);
    },
    destroy: () => renderer.destroy(),
  };
};
