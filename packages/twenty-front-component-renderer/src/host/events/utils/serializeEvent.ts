import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type SerializedEventData } from '@/types/SerializedEventData';

import { applyEventModifierKeys } from '@/host/events/utils/applyEventModifierKeys';
import { applyEventTargetProperties } from '@/host/events/utils/applyEventTargetProperties';
import { applyInputEventProperties } from '@/host/events/utils/applyInputEventProperties';
import { applyKeyboardEventProperties } from '@/host/events/utils/applyKeyboardEventProperties';
import { applyMouseEventProperties } from '@/host/events/utils/applyMouseEventProperties';
import { applyPointerEventProperties } from '@/host/events/utils/applyPointerEventProperties';
import { applyWheelEventProperties } from '@/host/events/utils/applyWheelEventProperties';

export const serializeEvent = (domEvent: unknown): SerializedEventData => {
  if (!isPlainObject(domEvent)) {
    return { type: 'unknown' };
  }

  const serialized: SerializedEventData = {
    type: isString(domEvent.type) ? domEvent.type : 'unknown',
  };

  applyEventModifierKeys({ serialized, domEvent });
  applyMouseEventProperties({ serialized, domEvent });
  applyPointerEventProperties({ serialized, domEvent });
  applyKeyboardEventProperties({ serialized, domEvent });
  applyInputEventProperties({ serialized, domEvent });
  applyWheelEventProperties({ serialized, domEvent });
  applyEventTargetProperties({ serialized, target: domEvent.target });

  return serialized;
};
