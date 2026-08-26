import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useOpenJunctionRelationFieldInput } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationFieldInput';
import { useOpenMorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationManyToOneFieldInput';
import { useOpenMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFieldWidgetFieldInputEditMode = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();
  const { openRelationFromManyFieldInput } =
    useOpenRelationFromManyFieldInput();

  const { openMorphRelationOneToManyFieldInput } =
    useOpenMorphRelationOneToManyFieldInput();

  const { openJunctionRelationFieldInput } =
    useOpenJunctionRelationFieldInput();

  const { openMorphRelationManyToOneFieldInput } =
    useOpenMorphRelationManyToOneFieldInput();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const openFieldInput = useCallback(
    ({
      fieldDefinition,
      recordId,
    }: {
      fieldDefinition: FieldDefinition<FieldMetadata>;
      recordId: string;
    }) => {
      if (
        isFieldRelationOneToMany(fieldDefinition) &&
        isDefined(
          getJunctionConfig({
            settings: fieldDefinition.metadata.settings,
            relationObjectMetadataId:
              fieldDefinition.metadata.relationObjectMetadataId,
            relationTargetFieldMetadataId:
              fieldDefinition.metadata.relationFieldMetadataId,
            sourceObjectMetadataId: objectMetadataItems.find(
              ({ nameSingular }) =>
                nameSingular ===
                fieldDefinition.metadata.objectMetadataNameSingular,
            )?.id,
            objectMetadataItems,
          }),
        )
      ) {
        openJunctionRelationFieldInput({
          fieldDefinition,
          recordId,
          recordPickerInstanceId: instanceId,
        });
        return;
      }

      if (isFieldRelationManyToOne(fieldDefinition)) {
        openRelationToOneFieldInput({
          fieldName: fieldDefinition.metadata.fieldName,
          recordId,
          prefix: instanceId,
        });

        return;
      }

      if (isFieldMorphRelationOneToMany(fieldDefinition)) {
        if (!isFieldMorphRelation(fieldDefinition)) {
          throw new Error('Field is not a morph relation one to many');
        }

        openMorphRelationOneToManyFieldInput({
          recordId,
          prefix: instanceId,
          fieldDefinition,
        });
        return;
      }

      if (isFieldRelationOneToMany(fieldDefinition)) {
        if (
          isDefined(fieldDefinition.metadata.relationObjectMetadataNameSingular)
        ) {
          openRelationFromManyFieldInput({
            fieldName: fieldDefinition.metadata.fieldName,
            objectNameSingular:
              fieldDefinition.metadata.relationObjectMetadataNameSingular,
            recordId,
            prefix: instanceId,
          });
          return;
        }
      }

      if (isFieldMorphRelationManyToOne(fieldDefinition)) {
        openMorphRelationManyToOneFieldInput({
          recordId,
          prefix: instanceId,
          fieldDefinition,
        });
        return;
      }

      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId: instanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [
      objectMetadataItems,
      instanceId,
      openJunctionRelationFieldInput,
      openMorphRelationManyToOneFieldInput,
      openMorphRelationOneToManyFieldInput,
      openRelationFromManyFieldInput,
      openRelationToOneFieldInput,
      pushFocusItemToFocusStack,
    ],
  );

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeFieldInput = () => {
    removeFocusItemFromFocusStackById({
      focusId: instanceId,
    });
  };

  return {
    openFieldInput,
    closeFieldInput,
  };
};
