import { isBoolean } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventModifierKeys = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isBoolean(domEvent.altKey)) {
    serialized.altKey = domEvent.altKey;
  }
  if (isBoolean(domEvent.ctrlKey)) {
    serialized.ctrlKey = domEvent.ctrlKey;
  }
  if (isBoolean(domEvent.metaKey)) {
    serialized.metaKey = domEvent.metaKey;
  }
  if (isBoolean(domEvent.shiftKey)) {
    serialized.shiftKey = domEvent.shiftKey;
  }
};
