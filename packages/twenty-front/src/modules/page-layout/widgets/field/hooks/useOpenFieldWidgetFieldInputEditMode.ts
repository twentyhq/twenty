import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOpenMorphRelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationManyToOneFieldInput';
import { useOpenMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput';
import { useOpenRelationFromManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput';
import { useOpenRelationToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenRelationToOneFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationFromManyValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useOpenFieldWidgetFieldInputEditMode = () => {
  const store = useStore();
  const { openRelationToOneFieldInput } = useOpenRelationToOneFieldInput();
  const { openRelationFromManyFieldInput } =
    useOpenRelationFromManyFieldInput();

  const { openMorphRelationOneToManyFieldInput } =
    useOpenMorphRelationOneToManyFieldInput();

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

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
        ['taskTarget', 'noteTarget'].includes(
          fieldDefinition.metadata.relationObjectMetadataNameSingular,
        )
      ) {
        const fieldValue = store.get(
          recordStoreFamilySelectorV2.selectorFamily({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
          }),
        ) as FieldRelationValue<FieldRelationFromManyValue>;

        const activity = store.get(recordStoreFamilyState.atomFamily(recordId));

        const objectMetadataItems = store.get(objectMetadataItemsState.atom);

        const activityTargetObjectRecords = getActivityTargetObjectRecords({
          activityRecord: activity as Task | Note,
          objectMetadataItems,
          activityTargets: fieldValue as NoteTarget[] | TaskTarget[],
        });

        openActivityTargetCellEditMode({
          recordPickerInstanceId: instanceId,
          activityTargetObjectRecords,
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
      instanceId,
      openActivityTargetCellEditMode,
      openMorphRelationManyToOneFieldInput,
      openMorphRelationOneToManyFieldInput,
      openRelationFromManyFieldInput,
      openRelationToOneFieldInput,
      pushFocusItemToFocusStack,
      store,
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
