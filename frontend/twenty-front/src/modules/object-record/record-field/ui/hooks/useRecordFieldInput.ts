import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldInputDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRecordFieldInput = <FieldValue>() => {
  const recordFieldInputDraftValue = useAtomComponentStateCallbackState(
    recordFieldInputDraftValueComponentState,
  );

  const store = useStore();

  const setDraftValue = useCallback(
    (newValue: unknown) => {
      store.set(recordFieldInputDraftValue, newValue);
    },
    [store, recordFieldInputDraftValue],
  );

  const isDraftValueEmpty = (
    value: FieldInputDraftValue<FieldValue> | undefined,
  ) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' && value === '') {
      return true;
    }

    return false;
  };

  return {
    setDraftValue,
    isDraftValueEmpty,
  };
};
