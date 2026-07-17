import { type RefObject, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { createWelcomeHalftoneMainThreadController } from '@/onboarding/components/WelcomeOverlay/createWelcomeHalftoneMainThreadController';
import { createWelcomeHalftoneWorkerController } from '@/onboarding/components/WelcomeOverlay/createWelcomeHalftoneWorkerController';
import { type WelcomeHalftoneController } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneController.type';

type WelcomeHalftoneCanvasEffectProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isLeaving: boolean;
  hasWorkerFailed: boolean;
  onWorkerFailed: () => void;
};

export const WelcomeHalftoneCanvasEffect = ({
  canvasRef,
  isLeaving,
  hasWorkerFailed,
  onWorkerFailed,
}: WelcomeHalftoneCanvasEffectProps) => {
  const [activeHalftoneController, setActiveHalftoneController] =
    useState<WelcomeHalftoneController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isDefined(canvas)) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const canvasStyles = getComputedStyle(canvas);
    const dotColor = canvasStyles
      .getPropertyValue('--welcome-dot-color')
      .trim();
    const dotHighlightColor =
      canvasStyles.getPropertyValue('--welcome-dot-highlight').trim() ||
      dotColor;
    const readDevicePixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, 2);
    const readCanvasClientSize = () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });

    const initialCanvasSize = readCanvasClientSize();
    const sharedControllerOptions = {
      canvas,
      dotColor,
      dotHighlightColor,
      prefersReducedMotion,
      initialCanvasWidth: initialCanvasSize.width,
      initialCanvasHeight: initialCanvasSize.height,
      devicePixelRatio: readDevicePixelRatio(),
    };

    const activeController =
      (hasWorkerFailed
        ? null
        : createWelcomeHalftoneWorkerController({
            ...sharedControllerOptions,
            onWorkerUnavailable: onWorkerFailed,
          })) ??
      createWelcomeHalftoneMainThreadController(sharedControllerOptions);

    if (!isDefined(activeController)) {
      return;
    }
    setActiveHalftoneController(activeController);

    const handleWindowResize = () => {
      const nextCanvasSize = readCanvasClientSize();
      activeController.resize(
        nextCanvasSize.width,
        nextCanvasSize.height,
        readDevicePixelRatio(),
      );
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      activeController.destroy();
    };
  }, [canvasRef, hasWorkerFailed, onWorkerFailed]);

  useEffect(() => {
    if (isLeaving) {
      activeHalftoneController?.leave();
    }
  }, [isLeaving, activeHalftoneController]);

  return null;
};
