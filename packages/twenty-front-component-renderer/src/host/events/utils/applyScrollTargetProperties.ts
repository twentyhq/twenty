import { isNumber } from '@sniptt/guards';

import { EVENT_SCROLL_STATE_KEYS } from '@/constants/EventScrollStateKeys';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyScrollTargetProperties = ({
  serializedEvent,
  target,
}: {
  serializedEvent: SerializedEventData;
  target: Record<string, unknown>;
}): void => {
  for (const key of EVENT_SCROLL_STATE_KEYS) {
    const value = target[key];

    if (isNumber(value)) {
      serializedEvent[key] = value;
    }
  }
};
