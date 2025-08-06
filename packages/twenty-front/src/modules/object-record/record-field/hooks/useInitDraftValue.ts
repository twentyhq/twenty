import { isUndefined } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { FIELD_NOT_OVERWRITTEN_AT_DRAFT } from '@/object-record/constants/FieldsNotOverwrittenAtDraft';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/utils/computeDraftValueFromFieldValue';
import { computeDraftValueFromString } from '@/object-record/record-field/utils/computeDraftValueFromString';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

export const useInitDraftValue = <FieldValue>() => {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        value,
        recordId,
        fieldDefinition,
        fieldComponentInstanceId,
      }: {
        value?: string;
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
        fieldComponentInstanceId: string;
      }) => {
        const recordFieldValue = snapshot
          .getLoadable(
            recordStoreFamilySelector<FieldValue>({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          )
          .getValue();

        if (
          isUndefined(value) ||
          FIELD_NOT_OVERWRITTEN_AT_DRAFT.includes(fieldDefinition.type)
        ) {
          set(
            recordFieldInputDraftValueComponentState.atomFamily({
              instanceId: fieldComponentInstanceId,
            }),
            computeDraftValueFromFieldValue<FieldValue>({
              fieldValue: recordFieldValue,
              fieldDefinition,
            }),
          );
        } else {
          set(
            recordFieldInputDraftValueComponentState.atomFamily({
              instanceId: fieldComponentInstanceId,
            }),
            computeDraftValueFromString<FieldValue>({
              value,
              fieldDefinition,
            }),
          );
        }
      },
    [],
  );
};
