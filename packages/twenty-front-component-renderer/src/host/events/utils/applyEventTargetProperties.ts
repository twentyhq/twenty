import { isBoolean, isNumber, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { serializeFileList } from '@/host/events/utils/serializeFileList';
import { serializeSelectedOptionIndexes } from '@/host/events/utils/serializeSelectedOptionIndexes';
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
  if (isString(targetRecord.value)) {
    serialized.value = targetRecord.value;
  }
  if (isBoolean(targetRecord.checked)) {
    serialized.checked = targetRecord.checked;
  }
  const selectedOptionIndexes = serializeSelectedOptionIndexes(target);
  if (isDefined(selectedOptionIndexes)) {
    serialized.selectedOptionIndexes = selectedOptionIndexes;
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
};
