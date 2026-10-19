import { type ClaimPointerEventForwarding } from '@/host/events/types/ClaimPointerEventForwarding';
import { type PushCapturedPointerEvent } from '@/host/events/types/PushCapturedPointerEvent';

export type HostPointerCaptureController = {
  startPointerCapture: (input: {
    element: HTMLElement;
    pointerId: number;
  }) => void;
  claimPointerEventForwarding: ClaimPointerEventForwarding;
  setPushCapturedPointerEvent: (
    pushCapturedPointerEvent: PushCapturedPointerEvent | null,
  ) => void;
  reset: () => void;
};
