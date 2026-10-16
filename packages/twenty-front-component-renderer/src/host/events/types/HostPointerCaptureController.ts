import { type HostPointerCaptureTransport } from '@/host/events/types/HostPointerCaptureTransport';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

export type HostPointerCaptureController = {
  startPointerCapture: (input: {
    element: HTMLElement;
    pointerId: number;
  }) => void;
  acceptWorkerPointerCapture: (request: PointerCaptureRequest) => void;
  releaseWorkerPointerCapture: (request: PointerCaptureRequest) => void;
  setTransport: (transport: HostPointerCaptureTransport | null) => void;
  reset: () => void;
};
