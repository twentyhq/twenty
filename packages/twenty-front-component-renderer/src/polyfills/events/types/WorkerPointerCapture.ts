import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

export type WorkerPointerCapture = {
  dispatchCapturedPointerEvent: (update: CapturedPointerEventUpdate) => void;
  refusePointerCapture: (request: PointerCaptureRequest) => void;
  scheduleDetachedCaptureSweep: () => void;
};
