import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { applyEventModifierKeys } from '@/host/events/utils/applyEventModifierKeys';
import { applyEventTargetProperties } from '@/host/events/utils/applyEventTargetProperties';
import { applyInputEventProperties } from '@/host/events/utils/applyInputEventProperties';
import { applyKeyboardEventProperties } from '@/host/events/utils/applyKeyboardEventProperties';
import { applyMouseEventProperties } from '@/host/events/utils/applyMouseEventProperties';
import { applyPointerEventProperties } from '@/host/events/utils/applyPointerEventProperties';
import { applyWheelEventProperties } from '@/host/events/utils/applyWheelEventProperties';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const serializeEvent = (domEvent: unknown): SerializedEventData => {
  if (!isPlainObject(domEvent)) {
    return { type: 'unknown' };
  }

  const serializedEvent: SerializedEventData = {
    type: isString(domEvent.type) ? domEvent.type : 'unknown',
  };

  applyEventModifierKeys({ serializedEvent, domEvent });
  applyMouseEventProperties({ serializedEvent, domEvent });
  applyPointerEventProperties({ serializedEvent, domEvent });
  applyKeyboardEventProperties({ serializedEvent, domEvent });
  applyInputEventProperties({ serializedEvent, domEvent });
  applyWheelEventProperties({ serializedEvent, domEvent });
  applyEventTargetProperties({ serializedEvent, target: domEvent.target });

  return serializedEvent;
};
