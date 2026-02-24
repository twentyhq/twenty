import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldInputDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';

export const useRecordFieldInput = <FieldValue>() => {
  const recordFieldInputDraftValueAtom = useRecoilComponentStateCallbackStateV2(
    recordFieldInputDraftValueComponentState,
  );

  const store = useStore();

  const setDraftValue = (newValue: unknown) => {
    store.set(recordFieldInputDraftValueAtom, newValue);
  };

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
