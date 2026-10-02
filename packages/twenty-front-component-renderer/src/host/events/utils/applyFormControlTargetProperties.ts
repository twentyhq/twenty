import { isBoolean, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CHECKED_STATE_SETTLED_EVENT_TYPES } from '@/host/events/constants/CheckedStateSettledEventTypes';
import { FORM_CONTROL_VALUE_SETTLED_EVENT_TYPES } from '@/host/events/constants/FormControlValueSettledEventTypes';
import { serializeFileList } from '@/host/events/utils/serializeFileList';
import { serializeSelectedOptionIndexes } from '@/host/events/utils/serializeSelectedOptionIndexes';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyFormControlTargetProperties = ({
  serialized,
  target,
}: {
  serialized: SerializedEventData;
  target: Record<string, unknown>;
}): void => {
  if (
    CHECKED_STATE_SETTLED_EVENT_TYPES.has(serialized.type) &&
    isBoolean(target.checked)
  ) {
    serialized.checked = target.checked;
  }

  if (!FORM_CONTROL_VALUE_SETTLED_EVENT_TYPES.has(serialized.type)) {
    return;
  }

  if (isString(target.value)) {
    serialized.value = target.value;
  }

  const selectedOptionIndexes = serializeSelectedOptionIndexes(target);
  if (isDefined(selectedOptionIndexes)) {
    serialized.selectedOptionIndexes = selectedOptionIndexes;
  }

  const files = serializeFileList(target.files);
  if (isDefined(files)) {
    serialized.files = files;
  }
};
