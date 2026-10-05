import { isBoolean, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { MUTED_STATE_SETTLED_EVENT_TYPE } from '@/host/events/constants/MutedStateSettledEventType';
import { applyFormControlTargetProperties } from '@/host/events/utils/applyFormControlTargetProperties';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventTargetProperties = ({
  serialized,
  target,
}: {
  serialized: SerializedEventData;
  target: unknown;
}): void => {
  if (!isPlainObject(target)) {
    return;
  }

  applyFormControlTargetProperties({ serialized, target });

  if (isNumber(target.scrollTop)) {
    serialized.scrollTop = target.scrollTop;
  }
  if (isNumber(target.scrollLeft)) {
    serialized.scrollLeft = target.scrollLeft;
  }
  if (isNumber(target.currentTime)) {
    serialized.currentTime = target.currentTime;
  }
  if (isNumber(target.duration)) {
    serialized.duration = target.duration;
  }
  if (isBoolean(target.paused)) {
    serialized.paused = target.paused;
  }
  if (isBoolean(target.ended)) {
    serialized.ended = target.ended;
  }
  if (isNumber(target.volume)) {
    serialized.volume = target.volume;
  }
  if (
    serialized.type === MUTED_STATE_SETTLED_EVENT_TYPE &&
    isBoolean(target.muted)
  ) {
    serialized.muted = target.muted;
  }
  if (isNumber(target.playbackRate)) {
    serialized.playbackRate = target.playbackRate;
  }
};
