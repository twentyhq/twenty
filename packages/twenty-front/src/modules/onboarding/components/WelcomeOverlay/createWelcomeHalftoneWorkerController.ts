import { type WelcomeHalftoneController } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneController.type';

import WelcomeHalftoneWorker from './welcomeHalftone.worker?worker';

const WORKER_READY_TIMEOUT_MS = 1500;

type CreateWelcomeHalftoneWorkerControllerOptions = {
  canvas: HTMLCanvasElement;
  dotColor: string;
  dotHighlightColor: string;
  prefersReducedMotion: boolean;
  initialCanvasWidth: number;
  initialCanvasHeight: number;
  devicePixelRatio: number;
  onWorkerUnavailable: () => void;
};

export const createWelcomeHalftoneWorkerController = ({
  canvas,
  dotColor,
  dotHighlightColor,
  prefersReducedMotion,
  initialCanvasWidth,
  initialCanvasHeight,
  devicePixelRatio,
  onWorkerUnavailable,
}: CreateWelcomeHalftoneWorkerControllerOptions): WelcomeHalftoneController | null => {
  const isOffscreenCanvasSupported =
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof canvas.transferControlToOffscreen === 'function';
  if (!isOffscreenCanvasSupported) {
    return null;
  }

  try {
    const worker = new WelcomeHalftoneWorker();
    let hasWorkerSettled = false;
    let workerReadyTimeoutId: ReturnType<typeof setTimeout>;
    const handleWorkerUnavailable = () => {
      if (hasWorkerSettled) {
        return;
      }
      hasWorkerSettled = true;
      clearTimeout(workerReadyTimeoutId);
      worker.terminate();
      onWorkerUnavailable();
    };
    workerReadyTimeoutId = setTimeout(
      handleWorkerUnavailable,
      WORKER_READY_TIMEOUT_MS,
    );
    worker.onerror = handleWorkerUnavailable;
    worker.onmessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'ready') {
        hasWorkerSettled = true;
        clearTimeout(workerReadyTimeoutId);
      }
    };

    const offscreenCanvas = canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        type: 'init',
        canvas: offscreenCanvas,
        width: initialCanvasWidth,
        height: initialCanvasHeight,
        devicePixelRatio,
        color: dotColor,
        highlightColor: dotHighlightColor,
        reducedMotion: prefersReducedMotion,
      },
      [offscreenCanvas],
    );

    return {
      leave: () => worker.postMessage({ type: 'leave' }),
      resize: (nextCanvasWidth, nextCanvasHeight, nextDevicePixelRatio) =>
        worker.postMessage({
          type: 'resize',
          width: nextCanvasWidth,
          height: nextCanvasHeight,
          devicePixelRatio: nextDevicePixelRatio,
        }),
      destroy: () => {
        hasWorkerSettled = true;
        clearTimeout(workerReadyTimeoutId);
        worker.postMessage({ type: 'stop' });
        worker.terminate();
      },
    };
  } catch {
    return null;
  }
};
