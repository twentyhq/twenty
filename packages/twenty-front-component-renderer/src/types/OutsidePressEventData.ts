import { type OUTSIDE_PRESS_EVENT_TYPES } from '@/constants/OutsidePressEventTypes';

export type OutsidePressEventData = {
  type: (typeof OUTSIDE_PRESS_EVENT_TYPES)[number];
  button: number;
  buttons: number;
  detail: number;
  pointerType: string;
};
