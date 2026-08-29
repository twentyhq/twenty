import { PointerActivationConstraints } from '@dnd-kit/dom';

// Same values as dnd-kit's own touch default: a swipe has to scroll the board,
// so a drag only starts after a press and hold that stays put.
const TOUCH_ACTIVATION_DELAY_IN_MS = 250;
const TOUCH_ACTIVATION_TOLERANCE_IN_PX = 5;

// dnd-kit also delays activation for mouse and pen, which we leave out: holding
// a card still would start a drag and swallow the click that opens the record.
const POINTER_ACTIVATION_DISTANCE_IN_PX = 8;

export const getDragActivationConstraints = (event: PointerEvent) =>
  event.pointerType === 'touch'
    ? [
        new PointerActivationConstraints.Delay({
          value: TOUCH_ACTIVATION_DELAY_IN_MS,
          tolerance: TOUCH_ACTIVATION_TOLERANCE_IN_PX,
        }),
      ]
    : [
        new PointerActivationConstraints.Distance({
          value: POINTER_ACTIVATION_DISTANCE_IN_PX,
        }),
      ];
