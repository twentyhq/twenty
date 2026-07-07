import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

import { WELCOME_HALFTONE_DASHES } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';
import { createWelcomeHalftoneRenderer } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneRenderer';

import WelcomeHalftoneWorker from './welcomeHalftone.worker?worker';
import './welcomeHalftone.css';

const StyledCanvas = styled.canvas`
  display: block;
  height: 100%;
  width: 100%;
`;

type WelcomeHalftoneController = {
  leave: () => void;
  resize: (width: number, height: number, devicePixelRatio: number) => void;
  destroy: () => void;
};

type WelcomeHalftoneCanvasProps = {
  isLeaving: boolean;
};

export const WelcomeHalftoneCanvas = ({
  isLeaving,
}: WelcomeHalftoneCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controller, setController] =
    useState<WelcomeHalftoneController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const styles = getComputedStyle(canvas);
    const color = styles.getPropertyValue('--welcome-dot-color').trim();
    const highlightColor =
      styles.getPropertyValue('--welcome-dot-highlight').trim() || color;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const readSize = () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });

    const createWorkerController = (): WelcomeHalftoneController | null => {
      if (
        typeof Worker === 'undefined' ||
        typeof OffscreenCanvas === 'undefined' ||
        typeof canvas.transferControlToOffscreen !== 'function'
      ) {
        return null;
      }

      try {
        const worker = new WelcomeHalftoneWorker();
        const offscreen = canvas.transferControlToOffscreen();
        const { width, height } = readSize();
        worker.postMessage(
          {
            type: 'init',
            canvas: offscreen,
            width,
            height,
            devicePixelRatio,
            color,
            highlightColor,
            reducedMotion,
          },
          [offscreen],
        );

        return {
          leave: () => worker.postMessage({ type: 'leave' }),
          resize: (nextWidth, nextHeight, nextDevicePixelRatio) =>
            worker.postMessage({
              type: 'resize',
              width: nextWidth,
              height: nextHeight,
              devicePixelRatio: nextDevicePixelRatio,
            }),
          destroy: () => {
            worker.postMessage({ type: 'stop' });
            worker.terminate();
          },
        };
      } catch {
        return null;
      }
    };

    const createMainThreadController = (): WelcomeHalftoneController | null => {
      let context: CanvasRenderingContext2D | null = null;
      try {
        context = canvas.getContext('2d');
      } catch {
        context = null;
      }
      if (context === null) {
        return null;
      }

      const applyBackingSize = (width: number, height: number) => {
        canvas.width = Math.round(width * devicePixelRatio);
        canvas.height = Math.round(height * devicePixelRatio);
      };

      const { width, height } = readSize();
      applyBackingSize(width, height);
      const renderer = createWelcomeHalftoneRenderer({
        context,
        dashes: WELCOME_HALFTONE_DASHES,
        width,
        height,
        devicePixelRatio,
        color,
        highlightColor,
        reducedMotion,
      });

      return {
        leave: () => renderer.leave(),
        resize: (nextWidth, nextHeight, nextDevicePixelRatio) => {
          applyBackingSize(nextWidth, nextHeight);
          renderer.resize(nextWidth, nextHeight, nextDevicePixelRatio);
        },
        destroy: () => renderer.destroy(),
      };
    };

    const activeController =
      createWorkerController() ?? createMainThreadController();
    if (activeController === null) {
      return;
    }
    setController(activeController);

    const handleResize = () => {
      const size = readSize();
      activeController.resize(size.width, size.height, devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      activeController.destroy();
    };
  }, []);

  useEffect(() => {
    if (isLeaving) {
      controller?.leave();
    }
  }, [isLeaving, controller]);

  return <StyledCanvas ref={canvasRef} aria-hidden="true" />;
};
