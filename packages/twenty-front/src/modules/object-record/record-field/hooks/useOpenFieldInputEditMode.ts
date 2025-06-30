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
import { getFieldInputInstanceId } from '@/object-record/record-field/utils/getFieldInputInstanceId';
import { INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/object-record/record-inline-cell/constants/InlineCellHotkeyScopeMemoizeKey';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
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
      }: {
        fieldDefinition: FieldDefinition<FieldMetadata>;
        recordId: string;
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
            recordPickerInstanceId: getFieldInputInstanceId({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
            activityTargetObjectRecords,
          });
          return;
        }

        if (isFieldRelationToOneObject(fieldDefinition)) {
          openRelationToOneFieldInput({
            fieldName: fieldDefinition.metadata.fieldName,
            recordId: recordId,
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
            return;
          }
        }

        pushFocusItemToFocusStack({
          focusId: getFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
          }),
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: getFieldInputInstanceId({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          },
          hotkeyScope: {
            scope: DEFAULT_CELL_SCOPE.scope,
            customScopes: DEFAULT_CELL_SCOPE.customScopes,
          },
          memoizeKey: INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
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
  }: {
    fieldDefinition: FieldDefinition<FieldMetadata>;
    recordId: string;
  }) => {
    removeFocusItemFromFocusStackById({
      focusId: getFieldInputInstanceId({
        recordId,
        fieldName: fieldDefinition.metadata.fieldName,
      }),
    });
  };

  return {
    openFieldInput,
    closeFieldInput,
  };
};
