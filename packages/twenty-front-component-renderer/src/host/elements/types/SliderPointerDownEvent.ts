import { type PointerEvent } from 'react';

export type SliderPointerDownEvent = Pick<
  PointerEvent<HTMLElement>,
  'currentTarget' | 'pointerId' | 'button' | 'defaultPrevented'
> & {
  nativeEvent: Pick<Event, 'isTrusted'>;
};
