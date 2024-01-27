import { useRecoilCallback } from 'recoil';

import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';

export const useRecordFieldInput = <T>(recordFieldInputId?: string) => {
  const { scopeId, getDraftValueSelector, getDraftValueState } =
    useRecordFieldInputStates<T>(recordFieldInputId);

  const setDraftValue = useRecoilCallback(
    ({ set }) =>
      (value: T) => {
        // Todo: protect this with guards to ensure that the current field value is of the correct type
        // FieldInputDValue is not the definitive field value.
        // For instance, for currency, we store it in micros (FieldValue), but we handle it not in micros while typing in the field input.
        set(getDraftValueState(), value);
      },
    [getDraftValueState],
  );

  const isDraftValueEmpty = (value: T) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' && value === '') {
      return true;
    }

    return false;
  };

  return {
    scopeId,
    setDraftValue,
    getDraftValueSelector,
    isDraftValueEmpty,
  };
};
