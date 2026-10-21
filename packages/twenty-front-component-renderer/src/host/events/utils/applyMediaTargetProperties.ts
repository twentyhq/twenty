import { isBoolean, isNumber } from '@sniptt/guards';

import { MUTED_STATE_SETTLED_EVENT_TYPE } from '@/host/events/constants/MutedStateSettledEventType';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyMediaTargetProperties = ({
  serializedEvent,
  target,
}: {
  serializedEvent: SerializedEventData;
  target: Record<string, unknown>;
}): void => {
  if (isNumber(target.currentTime)) {
    serializedEvent.currentTime = target.currentTime;
  }
  if (isNumber(target.duration)) {
    serializedEvent.duration = target.duration;
  }
  if (isBoolean(target.paused)) {
    serializedEvent.paused = target.paused;
  }
  if (isBoolean(target.ended)) {
    serializedEvent.ended = target.ended;
  }
  if (isNumber(target.volume)) {
    serializedEvent.volume = target.volume;
  }
  if (
    serializedEvent.type === MUTED_STATE_SETTLED_EVENT_TYPE &&
    isBoolean(target.muted)
  ) {
    serializedEvent.muted = target.muted;
  }
  if (isNumber(target.playbackRate)) {
    serializedEvent.playbackRate = target.playbackRate;
  }
};
