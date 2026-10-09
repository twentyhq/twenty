import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { INPUT_VALUE_SEQUENCE_BRIDGE_PROPERTY } from '@/constants/InputValueSequenceBridgeProperty';
import { SERIALIZED_EVENT_TARGET_PROPERTY_KEYS } from '@/remote/elements/constants/SerializedEventTargetPropertyKeys';
import { workerInputValueSequenceByElement } from '@/remote/elements/states/workerInputValueSequenceByElement';
import { applySelectedOptionIndexes } from '@/remote/elements/utils/applySelectedOptionIndexes';
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
  const { inputValueSequence } = eventData;
  const hasInputValueSequence = isNumber(inputValueSequence);
  const isNewInputValue =
    hasInputValueSequence &&
    inputValueSequence > (workerInputValueSequenceByElement.get(element) ?? 0);
  const isStaleInputValue = hasInputValueSequence && !isNewInputValue;

  if (isNewInputValue) {
    workerInputValueSequenceByElement.set(element, inputValueSequence);
    queueMicrotask(() => {
      updateRemoteElementProperty(
        element as Element,
        INPUT_VALUE_SEQUENCE_BRIDGE_PROPERTY,
        workerInputValueSequenceByElement.get(element),
      );
    });
  }

  for (const key of SERIALIZED_EVENT_TARGET_PROPERTY_KEYS) {
    if (key === 'value' && isStaleInputValue) {
      continue;
    }

    if (key in eventData) {
      Reflect.set(element, key, eventData[key]);
    }
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
