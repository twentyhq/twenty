import { type SliderPointerDownEvent } from '@/host/elements/types/SliderPointerDownEvent';

export type SliderPointerCaptureProps = {
  onPointerDown: (event: SliderPointerDownEvent) => void;
};
