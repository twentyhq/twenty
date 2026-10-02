import { isBoolean, isNumber, isObject } from '@sniptt/guards';

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
  if (!isObject(target)) {
    return;
  }

  const targetRecord = target as Record<string, unknown>;

  applyFormControlTargetProperties({ serialized, target: targetRecord });

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
  if (
    serialized.type === MUTED_STATE_SETTLED_EVENT_TYPE &&
    isBoolean(targetRecord.muted)
  ) {
    serialized.muted = targetRecord.muted;
  }
  if (isNumber(targetRecord.playbackRate)) {
    serialized.playbackRate = targetRecord.playbackRate;
  }
};
