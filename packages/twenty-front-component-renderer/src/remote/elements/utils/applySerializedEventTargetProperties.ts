import { isDefined } from 'twenty-shared/utils';

import { SERIALIZED_EVENT_TARGET_PROPERTY_KEYS } from '@/remote/elements/constants/SerializedEventTargetPropertyKeys';
import { applySelectedOptionIndexes } from '@/remote/elements/utils/applySelectedOptionIndexes';
import { installFilesResetOnValueClear } from '@/remote/elements/utils/installFilesResetOnValueClear';
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
  for (const key of SERIALIZED_EVENT_TARGET_PROPERTY_KEYS) {
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
