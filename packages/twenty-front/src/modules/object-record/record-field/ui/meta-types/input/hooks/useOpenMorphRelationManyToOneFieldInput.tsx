import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMorphRelationMetadata,
  type FieldRelationToOneValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export const useOpenMorphRelationManyToOneFieldInput = () => {
  const store = useStore();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { openSingleRecordPicker } = useSingleRecordPickerOpen();

  const openMorphRelationManyToOneFieldInput = useCallback(
    ({
      fieldDefinition,
      recordId,
      prefix,
    }: {
      fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
      recordId: string;
      prefix?: string;
    }) => {
      const potentielFieldNames = fieldDefinition.metadata.morphRelations.map(
        (morphRelation) => {
          return computeMorphRelationFieldName({
            fieldName: fieldDefinition.metadata.fieldName,
            relationType: fieldDefinition.metadata.relationType,
            targetObjectMetadataNameSingular:
              morphRelation.targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural:
              morphRelation.targetObjectMetadata.namePlural,
          });
        },
      );

      const fieldValue = potentielFieldNames
        .map((fieldName) => {
          return store.get(
            recordStoreFamilySelectorV2.selectorFamily({
              recordId,
              fieldName,
            }),
          ) as FieldRelationValue<FieldRelationToOneValue>;
        })
        .find((fieldValue) => isDefined(fieldValue));

      const recordPickerInstanceId = getRecordFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
        prefix,
      });

      if (isDefined(fieldValue)) {
        store.set(
          singleRecordPickerSelectedIdComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          fieldValue.id,
        );
      }

      openSingleRecordPicker(recordPickerInstanceId);

      pushFocusItemToFocusStack({
        focusId: recordPickerInstanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId: recordPickerInstanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [openSingleRecordPicker, pushFocusItemToFocusStack, store],
  );

  return { openMorphRelationManyToOneFieldInput };
};
