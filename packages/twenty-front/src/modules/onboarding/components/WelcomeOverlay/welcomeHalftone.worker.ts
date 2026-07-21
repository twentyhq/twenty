import { WELCOME_HALFTONE_DASHES } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneDots';
import { createWelcomeHalftoneRenderer } from '@/onboarding/components/WelcomeOverlay/welcomeHalftoneRenderer';

type InitMessage = {
  type: 'init';
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  devicePixelRatio: number;
  color: string;
  highlightColor: string;
  reducedMotion: boolean;
};

type ResizeMessage = {
  type: 'resize';
  width: number;
  height: number;
  devicePixelRatio: number;
};

type WelcomeHalftoneWorkerMessage =
  | InitMessage
  | ResizeMessage
  | { type: 'leave' }
  | { type: 'stop' };

const workerSelf = self as unknown as {
  postMessage: (message: unknown) => void;
};

let renderer: ReturnType<typeof createWelcomeHalftoneRenderer> | null = null;
let offscreenCanvas: OffscreenCanvas | null = null;

const applyBackingSize = (
  width: number,
  height: number,
  devicePixelRatio: number,
) => {
  if (offscreenCanvas === null) {
    return;
  }
  offscreenCanvas.width = Math.round(width * devicePixelRatio);
  offscreenCanvas.height = Math.round(height * devicePixelRatio);
};

addEventListener(
  'message',
  (event: MessageEvent<WelcomeHalftoneWorkerMessage>) => {
    const message = event.data;

    if (message.type === 'init') {
      offscreenCanvas = message.canvas;
      applyBackingSize(message.width, message.height, message.devicePixelRatio);
      const context = offscreenCanvas.getContext('2d');
      if (context === null) {
        return;
      }
      renderer = createWelcomeHalftoneRenderer({
        context,
        dashes: WELCOME_HALFTONE_DASHES,
        width: message.width,
        height: message.height,
        devicePixelRatio: message.devicePixelRatio,
        color: message.color,
        highlightColor: message.highlightColor,
        reducedMotion: message.reducedMotion,
      });
      workerSelf.postMessage({ type: 'ready' });
    } else if (message.type === 'resize') {
      applyBackingSize(message.width, message.height, message.devicePixelRatio);
      renderer?.resize(message.width, message.height, message.devicePixelRatio);
    } else if (message.type === 'leave') {
      renderer?.leave();
    } else if (message.type === 'stop') {
      renderer?.destroy();
      renderer = null;
    }
  },
);
