import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldMetadata,
  FieldRelationFromManyValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenFieldInputEditMode = () => {
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();
  const { openRelationFromManyFieldInput } =
    useOpenRelationFromManyFieldInput();

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

  const openFieldInput = useRecoilCallback(
    ({ snapshot }) =>
      ({
        fieldDefinition,
        recordId,
      }: {
        fieldDefinition: FieldDefinition<FieldMetadata>;
        recordId: string;
      }) => {
        if (isFieldRelationToOneObject(fieldDefinition)) {
          openRelationToOneFieldInput({
            fieldName: fieldDefinition.metadata.fieldName,
            recordId: recordId,
          });
        }

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
            recordPickerInstanceId: `relation-from-many-field-input-${recordId}`,
            activityTargetObjectRecords,
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
              recordId: recordId,
            });
          }
        }
      },
    [
      openActivityTargetCellEditMode,
      openRelationFromManyFieldInput,
      openRelationToOneFieldInput,
    ],
  );

  return {
    openFieldInput: openFieldInput,
    closeFieldInput: () => {},
  };
};
