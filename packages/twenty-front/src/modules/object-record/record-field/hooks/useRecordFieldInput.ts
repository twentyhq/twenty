import { isUndefined } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { FIELD_NOT_OVERWRITTEN_AT_DRAFT } from '@/object-record/constants/FieldsNotOverwrittenAtDraft';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInputStates } from '@/object-record/record-field/hooks/internal/useRecordFieldInputStates';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/utils/computeDraftValueFromFieldValue';
import { computeDraftValueFromString } from '@/object-record/record-field/utils/computeDraftValueFromString';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

export const useRecordFieldInput = <FieldValue>(
  recordFieldInputId?: string,
) => {
  const { scopeId, getDraftValueSelector } =
    useRecordFieldInputStates<FieldValue>(recordFieldInputId);

  const { entityId, fieldDefinition } = useContext(FieldContext);

  const setDraftValue = useSetRecoilState(getDraftValueSelector());

  const initDraftValue = useRecoilCallback(
    ({ set, snapshot }) =>
      (value?: string) => {
        const recordFieldValue = snapshot
          .getLoadable(
            recordStoreFamilySelector<FieldValue>({
              recordId: entityId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          )
          .getValue();

        if (
          isUndefined(value) ||
          FIELD_NOT_OVERWRITTEN_AT_DRAFT.includes(fieldDefinition.type) === true
        ) {
          set(
            getDraftValueSelector(),
            computeDraftValueFromFieldValue<FieldValue>({
              fieldValue: recordFieldValue,
              fieldDefinition,
            }),
          );
        } else {
          set(
            getDraftValueSelector(),
            computeDraftValueFromString<FieldValue>({
              value,
              fieldDefinition,
            }),
          );
        }
      },
    [entityId, fieldDefinition, getDraftValueSelector],
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
    scopeId,
    setDraftValue,
    getDraftValueSelector,
    initDraftValue,
    isDraftValueEmpty,
  };
};
