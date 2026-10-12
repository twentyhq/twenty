import { isBoolean } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventModifierKeys = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isBoolean(domEvent.altKey)) {
    serializedEvent.altKey = domEvent.altKey;
  }
  if (isBoolean(domEvent.ctrlKey)) {
    serializedEvent.ctrlKey = domEvent.ctrlKey;
  }
  if (isBoolean(domEvent.metaKey)) {
    serializedEvent.metaKey = domEvent.metaKey;
  }
  if (isBoolean(domEvent.shiftKey)) {
    serializedEvent.shiftKey = domEvent.shiftKey;
  }
};
