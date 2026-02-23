import { isUndefined } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useRecoilCallback } from 'recoil';

import { FIELD_NOT_OVERWRITTEN_AT_DRAFT } from '@/object-record/constants/FieldsNotOverwrittenAtDraft';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { computeDraftValueFromString } from '@/object-record/record-field/ui/utils/computeDraftValueFromString';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';

export const useInitDraftValue = <FieldValue>() => {
  const store = useStore();
  return useRecoilCallback(
    ({ set }) =>
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
        const recordFieldValue = store.get(
          recordStoreFamilySelectorV2.selectorFamily({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
          }),
        ) as FieldValue;

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
    [store],
  );
};
