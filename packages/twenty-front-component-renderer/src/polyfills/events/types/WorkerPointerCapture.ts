import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';

export type WorkerPointerCapture = {
  dispatchCapturedPointerEvent: (update: CapturedPointerEventUpdate) => void;
  scheduleDetachedCaptureSweep: () => void;
};
