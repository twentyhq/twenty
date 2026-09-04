import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMorphRelationMetadata,
  type FieldRelationToOneValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  computeMorphRelationGqlFieldName,
  isDefined,
} from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useOpenMorphRelationManyToOneFieldInput = () => {
  const surfaceId = useComponentStateSurfaceId();
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
          return computeMorphRelationGqlFieldName({
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
            recordStoreFamilySelector.selectorFamily({
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
            surfaceId,
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
    [openSingleRecordPicker, pushFocusItemToFocusStack, store, surfaceId],
  );

  return { openMorphRelationManyToOneFieldInput };
};
