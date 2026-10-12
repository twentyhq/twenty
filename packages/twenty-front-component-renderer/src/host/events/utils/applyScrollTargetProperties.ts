import { isNumber } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyScrollTargetProperties = ({
  serializedEvent,
  target,
}: {
  serializedEvent: SerializedEventData;
  target: Record<string, unknown>;
}): void => {
  if (isNumber(target.scrollTop)) {
    serializedEvent.scrollTop = target.scrollTop;
  }
  if (isNumber(target.scrollLeft)) {
    serializedEvent.scrollLeft = target.scrollLeft;
  }
};
