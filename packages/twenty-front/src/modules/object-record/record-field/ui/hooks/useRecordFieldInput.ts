import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldInputDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useRecordFieldInput = <FieldValue>() => {
  const recordFieldInputDraftValueCallbackState =
    useRecoilComponentCallbackState(recordFieldInputDraftValueComponentState);

  const setDraftValue = useRecoilCallback(
    ({ set }) =>
      (newValue: unknown) => {
        set(recordFieldInputDraftValueCallbackState, newValue);
      },
    [recordFieldInputDraftValueCallbackState],
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
