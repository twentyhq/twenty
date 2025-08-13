import { useCallback, useState, type RefObject } from 'react';

import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';

export const useFocusManagement = (
  inputRefs: {
    [key in keyof FieldAddressDraftValue]?: RefObject<HTMLInputElement>;
  },
  internalValue: FieldAddressDraftValue,
  onTab?: (newAddress: FieldAddressDraftValue) => void,
  onShiftTab?: (newAddress: FieldAddressDraftValue) => void,
) => {
  const [focusPosition, setFocusPosition] =
    useState<keyof FieldAddressDraftValue>('addressStreet1');

  const getFocusHandler = useCallback(
    (fieldName: keyof FieldAddressDraftValue) => () => {
      setFocusPosition(fieldName);
      inputRefs[fieldName]?.current?.focus();
    },
    [inputRefs],
  );

  const handleTab = useCallback(() => {
    const currentFocusPosition = Object.keys(inputRefs).findIndex(
      (key) => key === focusPosition,
    );
    const maxFocusPosition = Object.keys(inputRefs).length - 1;
    const nextFocusPosition = currentFocusPosition + 1;
    const isFocusPositionAfterLast = nextFocusPosition > maxFocusPosition;

    if (isFocusPositionAfterLast) {
      onTab?.(internalValue);
    } else {
      const nextFocusFieldName = Object.keys(inputRefs)[
        nextFocusPosition
      ] as keyof FieldAddressDraftValue;

      setFocusPosition(nextFocusFieldName);
      inputRefs[nextFocusFieldName]?.current?.focus();
    }
  }, [focusPosition, inputRefs, internalValue, onTab]);

  const handleShiftTab = useCallback(() => {
    const currentFocusPosition = Object.keys(inputRefs).findIndex(
      (key) => key === focusPosition,
    );
    const nextFocusPosition = currentFocusPosition - 1;
    const isFocusPositionBeforeFirst = nextFocusPosition < 0;

    if (isFocusPositionBeforeFirst) {
      onShiftTab?.(internalValue);
    } else {
      const nextFocusFieldName = Object.keys(inputRefs)[
        nextFocusPosition
      ] as keyof FieldAddressDraftValue;

      setFocusPosition(nextFocusFieldName);
      inputRefs[nextFocusFieldName]?.current?.focus();
    }
  }, [focusPosition, inputRefs, internalValue, onShiftTab]);

  return {
    focusPosition,
    getFocusHandler,
    handleTab,
    handleShiftTab,
  };
};
