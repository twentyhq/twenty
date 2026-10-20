import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';

export type PushCapturedPointerEvent = (
  update: CapturedPointerEventUpdate,
) => void;
