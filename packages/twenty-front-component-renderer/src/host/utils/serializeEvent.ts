import { isBoolean, isNumber, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/constants/MaxSerializedEventTextLength';
import { applyFirstChangedTouchCoordinates } from '@/host/utils/applyFirstChangedTouchCoordinates';
import { applyPasteClipboardText } from '@/host/utils/applyPasteClipboardText';
import { serializeFileList } from '@/host/utils/serializeFileList';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const serializeEvent = (event: unknown): SerializedEventData => {
  if (!isObject(event)) {
    return { type: 'unknown' };
  }

  const domEvent = event as Record<string, unknown>;
  const serialized: SerializedEventData = {
    type: isString(domEvent.type) ? domEvent.type : 'unknown',
  };

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

  if (isNumber(domEvent.clientX)) {
    serialized.clientX = domEvent.clientX;
  }
  if (isNumber(domEvent.clientY)) {
    serialized.clientY = domEvent.clientY;
  }
  if (isNumber(domEvent.x)) {
    serialized.x = domEvent.x;
  }
  if (isNumber(domEvent.y)) {
    serialized.y = domEvent.y;
  }
  if (isNumber(domEvent.pageX)) {
    serialized.pageX = domEvent.pageX;
  }
  if (isNumber(domEvent.pageY)) {
    serialized.pageY = domEvent.pageY;
  }
  if (isNumber(domEvent.screenX)) {
    serialized.screenX = domEvent.screenX;
  }
  if (isNumber(domEvent.screenY)) {
    serialized.screenY = domEvent.screenY;
  }
  if (isNumber(domEvent.offsetX)) {
    serialized.offsetX = domEvent.offsetX;
  }
  if (isNumber(domEvent.offsetY)) {
    serialized.offsetY = domEvent.offsetY;
  }
  if (isNumber(domEvent.movementX)) {
    serialized.movementX = domEvent.movementX;
  }
  if (isNumber(domEvent.movementY)) {
    serialized.movementY = domEvent.movementY;
  }
  if (isNumber(domEvent.button)) {
    serialized.button = domEvent.button;
  }
  if (isNumber(domEvent.buttons)) {
    serialized.buttons = domEvent.buttons;
  }

  applyFirstChangedTouchCoordinates(serialized, domEvent);

  if (isNumber(domEvent.pointerId)) {
    serialized.pointerId = domEvent.pointerId;
  }
  if (isString(domEvent.pointerType)) {
    serialized.pointerType = domEvent.pointerType;
  }
  if (isNumber(domEvent.pressure)) {
    serialized.pressure = domEvent.pressure;
  }
  if (isNumber(domEvent.tangentialPressure)) {
    serialized.tangentialPressure = domEvent.tangentialPressure;
  }
  if (isNumber(domEvent.tiltX)) {
    serialized.tiltX = domEvent.tiltX;
  }
  if (isNumber(domEvent.tiltY)) {
    serialized.tiltY = domEvent.tiltY;
  }
  if (isNumber(domEvent.twist)) {
    serialized.twist = domEvent.twist;
  }
  if (isNumber(domEvent.width)) {
    serialized.width = domEvent.width;
  }
  if (isNumber(domEvent.height)) {
    serialized.height = domEvent.height;
  }
  if (isBoolean(domEvent.isPrimary)) {
    serialized.isPrimary = domEvent.isPrimary;
  }

  if (isString(domEvent.key)) {
    serialized.key = domEvent.key;
  }
  if (isString(domEvent.code)) {
    serialized.code = domEvent.code;
  }
  if (isBoolean(domEvent.repeat)) {
    serialized.repeat = domEvent.repeat;
  }

  if (isString(domEvent.inputType)) {
    serialized.inputType = domEvent.inputType;
  }
  if (isString(domEvent.data)) {
    serialized.data = domEvent.data.slice(0, MAX_SERIALIZED_EVENT_TEXT_LENGTH);
  }

  applyPasteClipboardText(serialized, domEvent);

  if (isNumber(domEvent.deltaX)) {
    serialized.deltaX = domEvent.deltaX;
  }
  if (isNumber(domEvent.deltaY)) {
    serialized.deltaY = domEvent.deltaY;
  }
  if (isNumber(domEvent.deltaZ)) {
    serialized.deltaZ = domEvent.deltaZ;
  }
  if (isNumber(domEvent.deltaMode)) {
    serialized.deltaMode = domEvent.deltaMode;
  }

  const target = domEvent.target;
  if (isObject(target)) {
    const targetRecord = target as Record<string, unknown>;
    if (isString(targetRecord.value)) {
      serialized.value = targetRecord.value;
    }
    if (isBoolean(targetRecord.checked)) {
      serialized.checked = targetRecord.checked;
    }
    if (isNumber(targetRecord.scrollTop)) {
      serialized.scrollTop = targetRecord.scrollTop;
    }
    if (isNumber(targetRecord.scrollLeft)) {
      serialized.scrollLeft = targetRecord.scrollLeft;
    }
    if (isNumber(targetRecord.currentTime)) {
      serialized.currentTime = targetRecord.currentTime;
    }
    if (isNumber(targetRecord.duration)) {
      serialized.duration = targetRecord.duration;
    }
    if (isBoolean(targetRecord.paused)) {
      serialized.paused = targetRecord.paused;
    }
    if (isBoolean(targetRecord.ended)) {
      serialized.ended = targetRecord.ended;
    }
    if (isNumber(targetRecord.volume)) {
      serialized.volume = targetRecord.volume;
    }
    if (isBoolean(targetRecord.muted)) {
      serialized.muted = targetRecord.muted;
    }
    if (isNumber(targetRecord.playbackRate)) {
      serialized.playbackRate = targetRecord.playbackRate;
    }

    const files = serializeFileList(targetRecord.files);
    if (isDefined(files)) {
      serialized.files = files;
    }
  }

  return serialized;
};
