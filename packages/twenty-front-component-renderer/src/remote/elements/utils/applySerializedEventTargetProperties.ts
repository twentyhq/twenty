import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { SERIALIZED_EVENT_TARGET_PROPERTY_KEYS } from '@/remote/elements/constants/SerializedEventTargetPropertyKeys';
import { acknowledgeNativeEdit } from '@/remote/elements/utils/acknowledgeNativeEdit';
import { applySelectedOptionIndexes } from '@/remote/elements/utils/applySelectedOptionIndexes';
import { installFilesResetOnValueClear } from '@/remote/elements/utils/installFilesResetOnValueClear';
import { isNativeEditAcknowledged } from '@/remote/elements/utils/isNativeEditAcknowledged';
import { uncheckOtherRadioButtons } from '@/remote/elements/utils/uncheckOtherRadioButtons';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { readInputSelectionState } from '@/utils/readInputSelectionState';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applySerializedEventTargetProperties = ({
  element,
  eventData,
}: {
  element: object;
  eventData: SerializedEventData;
}): void => {
  const { nativeEditSequence } = eventData;
  const hasNativeEditSequence = isNumber(nativeEditSequence);
  const isValueFromAcknowledgedNativeEdit =
    hasNativeEditSequence &&
    isNativeEditAcknowledged({ remoteElement: element, nativeEditSequence });

  if (hasNativeEditSequence && !isValueFromAcknowledgedNativeEdit) {
    acknowledgeNativeEdit({ remoteElement: element, nativeEditSequence });
  }

  for (const key of SERIALIZED_EVENT_TARGET_PROPERTY_KEYS) {
    const shouldKeepCurrentValue =
      key === 'value' && isValueFromAcknowledgedNativeEdit;

    if (shouldKeepCurrentValue) {
      continue;
    }

    if (key in eventData) {
      Reflect.set(element, key, eventData[key]);
    }
  }

  if (isDefined(eventData.files)) {
    installFilesResetOnValueClear(element);
  }

  const selectionState = readInputSelectionState(eventData);
  if (isDefined(selectionState)) {
    workerInputSelectionStore.applySnapshot({ element, state: selectionState });
  }

  if (eventData.checked) {
    uncheckOtherRadioButtons(element);
  }

  if (isDefined(eventData.selectedOptionIndexes)) {
    applySelectedOptionIndexes({
      element,
      selectedOptionIndexes: eventData.selectedOptionIndexes,
    });
  }
};
