import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useOpenJunctionRelationFieldInput } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationFieldInput';
import { useOpenMorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationManyToOneFieldInput';
import { useOpenMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationMetadataSettings,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { hasJunctionTargetRelationFieldIds } from '@/object-record/record-field/ui/utils/isJunctionRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFieldInputEditMode = () => {
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();
  const { openRelationFromManyFieldInput } =
    useOpenRelationFromManyFieldInput();

  const { openMorphRelationOneToManyFieldInput } =
    useOpenMorphRelationOneToManyFieldInput();

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

  const { openJunctionRelationFieldInput } =
    useOpenJunctionRelationFieldInput();

  const { openMorphRelationManyToOneFieldInput } =
    useOpenMorphRelationManyToOneFieldInput();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openFieldInput = useRecoilCallback(
    ({ snapshot }) =>
      ({
        fieldDefinition,
        recordId,
        prefix,
      }: {
        fieldDefinition: FieldDefinition<FieldMetadata>;
        recordId: string;
        prefix?: string;
      }) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        // Get the actual field metadata item with saved settings from the database
        const { fieldMetadataItem } = getFieldMetadataItemById({
          fieldMetadataId: fieldDefinition.fieldMetadataId,
          objectMetadataItems,
        });

        // Check for metadata-driven junction relation (many-to-many through junction)
        const isOneToMany = isFieldRelationOneToMany(fieldDefinition);
        const hasJunctionConfig = hasJunctionTargetRelationFieldIds(
          fieldMetadataItem?.settings as FieldRelationMetadataSettings,
        );

        if (isOneToMany && hasJunctionConfig) {
          openJunctionRelationFieldInput({
            fieldDefinition:
              fieldDefinition as FieldDefinition<FieldRelationMetadata>,
            recordId,
            prefix,
          });
          return;
        }

        // Backward compatibility: hardcoded taskTarget/noteTarget check
        // TODO: Remove this once taskTarget/noteTarget are migrated to use junction configuration
        if (
          isFieldRelationOneToMany(fieldDefinition) &&
          ['taskTarget', 'noteTarget'].includes(
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          )
        ) {
          const fieldValue = snapshot
            .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
              recordStoreFamilySelector({
                recordId,
                fieldName: fieldDefinition.metadata.fieldName,
              }),
            )
            .getValue();

          const activity = snapshot
            .getLoadable(recordStoreFamilyState(recordId))
            .getValue();

          const activityTargetObjectRecords = getActivityTargetObjectRecords({
            activityRecord: activity as Task | Note,
            objectMetadataItems,
            activityTargets: fieldValue as NoteTarget[] | TaskTarget[],
          });

          openActivityTargetCellEditMode({
            recordPickerInstanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
              prefix,
            }),
            activityTargetObjectRecords,
          });
          return;
        }

        if (isFieldRelationManyToOne(fieldDefinition)) {
          openRelationToOneFieldInput({
            fieldName: fieldDefinition.metadata.fieldName,
            recordId,
            prefix,
          });

          return;
        }

        if (isFieldMorphRelationOneToMany(fieldDefinition)) {
          if (!isFieldMorphRelation(fieldDefinition)) {
            throw new Error('Field is not a morph relation one to many');
          }

          openMorphRelationOneToManyFieldInput({
            recordId,
            prefix,
            fieldDefinition,
          });
          return;
        }

        if (isFieldRelationOneToMany(fieldDefinition)) {
          if (
            isDefined(
              fieldDefinition.metadata.relationObjectMetadataNameSingular,
            )
          ) {
            openRelationFromManyFieldInput({
              fieldName: fieldDefinition.metadata.fieldName,
              objectNameSingular:
                fieldDefinition.metadata.relationObjectMetadataNameSingular,
              recordId,
              prefix,
            });
            return;
          }
        }

        if (isFieldMorphRelationManyToOne(fieldDefinition)) {
          openMorphRelationManyToOneFieldInput({
            recordId,
            prefix,
            fieldDefinition,
          });
          return;
        }

        pushFocusItemToFocusStack({
          focusId: getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix,
          }),
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
              prefix,
            }),
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      },
    [
      openActivityTargetCellEditMode,
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

  const closeFieldInput = ({
    fieldDefinition,
    recordId,
    prefix,
  }: {
    fieldDefinition: FieldDefinition<FieldMetadata>;
    recordId: string;
    prefix?: string;
  }) => {
    removeFocusItemFromFocusStackById({
      focusId: getRecordFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
        prefix,
      }),
    });
  };

  return {
    openFieldInput,
    closeFieldInput,
  };
};
