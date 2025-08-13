import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationFromManyValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/ui/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/ui/types/guards/isFieldRelationToOneObject';
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

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

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
        if (
          isFieldRelationFromManyObjects(fieldDefinition) &&
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

          const objectMetadataItems = snapshot
            .getLoadable(objectMetadataItemsState)
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

        if (isFieldRelationToOneObject(fieldDefinition)) {
          openRelationToOneFieldInput({
            fieldName: fieldDefinition.metadata.fieldName,
            recordId,
            prefix,
          });

          return;
        }

        if (isFieldRelationFromManyObjects(fieldDefinition)) {
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
