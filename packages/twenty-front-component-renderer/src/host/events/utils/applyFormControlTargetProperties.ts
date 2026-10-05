import { isBoolean, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { CHECKED_STATE_SETTLED_EVENT_TYPES } from '@/host/events/constants/CheckedStateSettledEventTypes';
import { FORM_CONTROL_VALUE_SETTLED_EVENT_TYPES } from '@/host/events/constants/FormControlValueSettledEventTypes';
import { serializeFileList } from '@/host/events/utils/serializeFileList';
import { serializeSelectedOptionIndexes } from '@/host/events/utils/serializeSelectedOptionIndexes';
import { readInputSelectionState } from '@/utils/readInputSelectionState';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyFormControlTargetProperties = ({
  serializedEvent,
  target,
}: {
  serializedEvent: SerializedEventData;
  target: Record<string, unknown>;
}): void => {
  Object.assign(serializedEvent, readInputSelectionState(target));

  if (
    CHECKED_STATE_SETTLED_EVENT_TYPES.has(serializedEvent.type) &&
    isBoolean(target.checked)
  ) {
    serializedEvent.checked = target.checked;
  }

  if (!FORM_CONTROL_VALUE_SETTLED_EVENT_TYPES.has(serializedEvent.type)) {
    return;
  }

  if (isString(target.value)) {
    serializedEvent.value = target.value;
  }

  const selectedOptionIndexes = serializeSelectedOptionIndexes(target);
  if (isDefined(selectedOptionIndexes)) {
    serializedEvent.selectedOptionIndexes = selectedOptionIndexes;
  }

  const serializedFiles = serializeFileList(target.files);
  if (isDefined(serializedFiles)) {
    serializedEvent.files = serializedFiles;
  }
};
