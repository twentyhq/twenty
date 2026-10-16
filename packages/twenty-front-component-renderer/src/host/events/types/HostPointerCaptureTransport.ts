import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';
import { type PointerCaptureRequest } from '@/types/PointerCaptureRequest';

export type HostPointerCaptureTransport = {
  pushCapturedPointerEvent: (update: CapturedPointerEventUpdate) => void;
  pushPointerCaptureRefusal: (request: PointerCaptureRequest) => void;
};
