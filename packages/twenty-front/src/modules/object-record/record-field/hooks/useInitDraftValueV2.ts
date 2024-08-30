import { isUndefined } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { FIELD_NOT_OVERWRITTEN_AT_DRAFT } from '@/object-record/constants/FieldsNotOverwrittenAtDraft';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/utils/computeDraftValueFromFieldValue';
import { computeDraftValueFromString } from '@/object-record/record-field/utils/computeDraftValueFromString';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';

export const useInitDraftValueV2 = <FieldValue>() => {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        value,
        recordId,
        fieldDefinition,
      }: {
        value?: string;
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
      }) => {
        const recordFieldInputScopeId = `${getRecordFieldInputId(
          recordId,
          fieldDefinition?.metadata?.fieldName,
        )}`;

        const getDraftValueSelector = extractComponentSelector<
          FieldInputDraftValue<FieldValue> | undefined
        >(recordFieldInputDraftValueComponentSelector, recordFieldInputScopeId);

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
    [],
  );
};
