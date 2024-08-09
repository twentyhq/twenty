import { useSetRecoilState } from 'recoil';

import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';

export const useRecordFieldInput = <FieldValue>(
  recordFieldInputId?: string,
) => {
  const { scopeId, getDraftValueSelector } =
    useRecordFieldInputStates<FieldValue>(recordFieldInputId);

  const setDraftValue = useSetRecoilState(getDraftValueSelector());

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
    scopeId,
    setDraftValue,
    getDraftValueSelector,
    isDraftValueEmpty,
  };
};
