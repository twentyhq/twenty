import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useOpenJunctionRelationFieldInput } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationFieldInput';
import { useOpenFilesFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenFilesFieldInput';
import { useOpenMorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationManyToOneFieldInput';
import { useOpenMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldFiles } from '@/object-record/record-field/ui/types/guards/isFieldFiles';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
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

  const { openFilesFieldInput } = useOpenFilesFieldInput();

  const { updateOneRecord } = useUpdateOneRecord();

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

        const currentWorkspace = snapshot
          .getLoadable(currentWorkspaceState)
          .getValue();

        const isJunctionRelationsEnabled =
          currentWorkspace?.featureFlags?.find(
            (flag) => (flag.key as string) === 'IS_JUNCTION_RELATIONS_ENABLED',
          )?.value ?? false;

        const isOneToMany = isFieldRelationOneToMany(fieldDefinition);
        const fieldHasJunctionConfig = hasJunctionConfig(
          fieldDefinition.metadata.settings,
        );

        // Handle Files field with custom behavior for empty state
        if (isFieldFiles(fieldDefinition)) {
          const objectMetadataItem = objectMetadataItems.find(
            (item) =>
              item.nameSingular ===
              fieldDefinition.metadata.objectMetadataNameSingular,
          );

          if (isDefined(objectMetadataItem)) {
            openFilesFieldInput({
              fieldName: fieldDefinition.metadata.fieldName,
              fieldMetadataId: fieldDefinition.fieldMetadataId,
              recordId,
              prefix,
              updateRecord: (updateInput) => {
                updateOneRecord({
                  objectNameSingular: objectMetadataItem.nameSingular,
                  idToUpdate: recordId,
                  updateOneRecordInput: updateInput,
                });
              },
              fieldDefinition: {
                metadata: {
                  settings: fieldDefinition.metadata.settings ?? undefined,
                },
              },
            });
            return;
          }
        }

        if (
          isJunctionRelationsEnabled &&
          isOneToMany &&
          fieldHasJunctionConfig
        ) {
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
      openFilesFieldInput,
      openJunctionRelationFieldInput,
      openMorphRelationManyToOneFieldInput,
      openMorphRelationOneToManyFieldInput,
      openRelationFromManyFieldInput,
      openRelationToOneFieldInput,
      pushFocusItemToFocusStack,
      updateOneRecord,
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
