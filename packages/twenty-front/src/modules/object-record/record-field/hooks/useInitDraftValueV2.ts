import { isUndefined } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/utils/computeDraftValueFromFieldValue';
import { computeDraftValueFromString } from '@/object-record/record-field/utils/computeDraftValueFromString';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';

export const useInitDraftValueV2 = <FieldValue>() => {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        value,
        entityId,
        fieldDefinition,
      }: {
        value?: string;
        entityId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
      }) => {
        const recordFieldInputScopeId = `${entityId}-${fieldDefinition?.metadata?.fieldName}-scope`;

        const getDraftValueSelector = extractComponentSelector<
          FieldInputDraftValue<FieldValue> | undefined
        >(recordFieldInputDraftValueComponentSelector, recordFieldInputScopeId);

        const recordFieldValue = snapshot
          .getLoadable(
            recordStoreFamilySelector<FieldValue>({
              recordId: entityId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          )
          .getValue();

        if (isUndefined(value)) {
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
            computeDraftValueFromString<FieldValue>({ value, fieldDefinition }),
          );
        }
      },
    [],
  );
};
