import { isNumber } from '@sniptt/guards';

import { type EventScrollState } from '@/polyfills/scroll/types/EventScrollState';
import { type SerializedEventData } from '@/types/SerializedEventData';

const EVENT_SCROLL_STATE_KEYS = [
  'scrollTop',
  'scrollLeft',
  'scrollWidth',
  'clientWidth',
] as const satisfies readonly (keyof EventScrollState)[];

export const readSerializedEventScrollState = (
  eventData: SerializedEventData,
): EventScrollState | null => {
  const eventScrollState: EventScrollState = {};
  let hasScrollState = false;

  for (const key of EVENT_SCROLL_STATE_KEYS) {
    const value = eventData[key];

    if (isNumber(value)) {
      eventScrollState[key] = value;
      hasScrollState = true;
    }
  }

  return hasScrollState ? eventScrollState : null;
};
