import { useContext, useMemo } from 'react';
import { v4 } from 'uuid';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { hasJunctionTargetRelationFieldIds } from '@/object-record/record-field/ui/hooks/useJunctionRelation';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { useRelationField } from '@/object-record/record-field/ui/meta-types/hooks/useRelationField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationMetadata,
  type FieldRelationMetadataSettings,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const RelationOneToManyFieldInput = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { onSubmit } = useContext(FieldInputEventContext);

  const { updateRelation } = useUpdateRelationOneToManyFieldInput();
  const fieldName = fieldDefinition.metadata.fieldName;
  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItem, objectMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    objectMetadataItems,
  });
  if (!fieldMetadataItem || !objectMetadataItem) {
    throw new CustomError(
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }
  const objectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

  const { updateActivityTargetFromCell } = useUpdateActivityTargetFromCell({
    activityObjectNameSingular: objectMetadataNameSingular as
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task,
    activityId: recordId,
  });

  const { fieldValue } = useRelationField();

  const handleSubmit = () => {
    onSubmit?.({ skipPersist: true });
  };

  const isRelationFromActivityTargets =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Task);

  // Check if this is a junction relation (many-to-many through junction)
  // Use fieldMetadataItem.settings which has the actual saved settings from the database
  const settings = fieldMetadataItem.settings as FieldRelationMetadataSettings;
  const isJunctionRelation = hasJunctionTargetRelationFieldIds(settings);

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    recordId,
    fieldValue as NoteTarget[] | TaskTarget[],
  );

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  // Junction relation handling
  const { updateJunctionRelationFromCell, isJunctionConfigValid } =
    useUpdateJunctionRelationFromCell({
      fieldMetadataItem,
      fieldDefinition: relationFieldDefinition,
      recordId,
    });

  // Get junction config for "Add New" and update functionality
  const junctionConfig = useMemo(() => {
    if (!isJunctionRelation || !isJunctionConfigValid || !settings) {
      return null;
    }
    const junctionObjectMetadata = objectMetadataItems.find(
      (item) =>
        item.id === relationFieldDefinition.metadata.relationObjectMetadataId,
    );
    if (!junctionObjectMetadata) return null;

    const targetFieldId = settings.junctionTargetRelationFieldIds?.[0];
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === targetFieldId,
    );
    if (!targetField?.relation) return null;

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === targetField.relation?.targetObjectMetadata.id,
    );
    if (!targetObjectMetadata) return null;

    // Find the source field on junction (points back to the current object)
    const sourceField = junctionObjectMetadata.fields.find(
      (field) =>
        field.type === 'RELATION' &&
        field.relation?.targetObjectMetadata.id === objectMetadataItem.id &&
        field.id !== targetFieldId,
    );

    return {
      junctionObjectMetadata,
      targetObjectMetadata,
      targetField,
      sourceField,
    };
  }, [
    isJunctionRelation,
    isJunctionConfigValid,
    objectMetadataItems,
    objectMetadataItem.id,
    relationFieldDefinition.metadata.relationObjectMetadataId,
    settings,
  ]);

  const junctionTargetObjectMetadata = junctionConfig?.targetObjectMetadata;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldDefinition.metadata.relationFieldMetadataId,
  );
  if (!relationFieldMetadataItem) {
    throw new CustomError(
      'Relation field metadata item not found',
      'RELATION_FIELD_METADATA_ITEM_NOT_FOUND',
    );
  }

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      fieldMetadataItem,
      objectMetadataItem,
      relationObjectMetadataNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  // Hooks for junction "Add New" - creates target object + junction record
  const { createOneRecord: createTargetRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionConfig?.targetObjectMetadata?.nameSingular ?? '',
  });
  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionConfig?.junctionObjectMetadata?.nameSingular ?? '',
    shouldMatchRootQueryFilter: true,
  });

  const layoutDirection = useRecoilComponentValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const multipleRecordPickerPickableMorphItemsCallbackState =
    useRecoilComponentCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      instanceId,
    );
  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const handleCreateNew = useRecoilCallback(
    ({ snapshot, set }) =>
      async (searchInput?: string) => {
        // For junction relations: create target object + junction record
        if (isJunctionRelation && isDefined(junctionConfig)) {
          const { targetObjectMetadata, targetField, sourceField } =
            junctionConfig;

          if (!targetField || !sourceField) {
            return;
          }

          // Create the target object
          const newTargetId = v4();
          const labelIdentifierType =
            getLabelIdentifierFieldMetadataItem(targetObjectMetadata)?.type;

          const createTargetPayload =
            labelIdentifierType === FieldMetadataType.FULL_NAME
              ? {
                  id: newTargetId,
                  name:
                    searchInput && searchInput.split(' ').length > 1
                      ? {
                          firstName: searchInput.split(' ')[0],
                          lastName: searchInput.split(' ').slice(1).join(' '),
                        }
                      : { firstName: searchInput, lastName: '' },
                }
              : { id: newTargetId, name: searchInput ?? '' };

          await createTargetRecord(createTargetPayload);

          // Create the junction record linking source to target
          const newJunctionId = v4();
          const junctionPayload = {
            id: newJunctionId,
            [`${sourceField.name}Id`]: recordId,
            [`${targetField.name}Id`]: newTargetId,
          };

          const createdJunction = await createJunctionRecord(junctionPayload);

          // Update the record store
          if (isDefined(createdJunction)) {
            set(recordStoreFamilyState(recordId), (currentRecord) => {
              if (!isDefined(currentRecord)) {
                return currentRecord;
              }
              const currentFieldValue = currentRecord[fieldName];
              const updatedJunctionRecords = Array.isArray(currentFieldValue)
                ? [...currentFieldValue, createdJunction]
                : [createdJunction];

              return {
                ...currentRecord,
                [fieldName]: updatedJunctionRecords,
              };
            });
          }

          // Update the picker state
          const multipleRecordPickerPickableMorphItems = snapshot
            .getLoadable(multipleRecordPickerPickableMorphItemsCallbackState)
            .getValue();

          const newMorphItems = multipleRecordPickerPickableMorphItems.concat({
            recordId: newTargetId,
            objectMetadataId: targetObjectMetadata.id,
            isSelected: true,
            isMatchingSearchFilter: true,
          });

          set(
            multipleRecordPickerPickableMorphItemsCallbackState,
            newMorphItems,
          );

          multipleRecordPickerPerformSearch({
            multipleRecordPickerInstanceId: instanceId,
            forceSearchFilter: searchInput,
            forceSearchableObjectMetadataItems: [targetObjectMetadata],
            forcePickableMorphItems: newMorphItems,
          });

          return;
        }

        // Normal relation handling
        const newRecordId =
          await createNewRecordAndOpenRightDrawer?.(searchInput);

        if (!isDefined(newRecordId)) {
          return;
        }

        const multipleRecordPickerPickableMorphItems = snapshot
          .getLoadable(multipleRecordPickerPickableMorphItemsCallbackState)
          .getValue();

        const newMorphItems = multipleRecordPickerPickableMorphItems.concat({
          recordId: newRecordId,
          objectMetadataId: relationObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        });

        set(multipleRecordPickerPickableMorphItemsCallbackState, newMorphItems);

        multipleRecordPickerPerformSearch({
          multipleRecordPickerInstanceId: instanceId,
          forceSearchFilter: searchInput,
          forceSearchableObjectMetadataItems: [relationObjectMetadataItem],
          forcePickableMorphItems: newMorphItems,
        });
      },
    [
      createNewRecordAndOpenRightDrawer,
      createTargetRecord,
      createJunctionRecord,
      fieldName,
      instanceId,
      isJunctionRelation,
      junctionConfig,
      multipleRecordPickerPickableMorphItemsCallbackState,
      multipleRecordPickerPerformSearch,
      recordId,
      relationObjectMetadataItem,
    ],
  );

  // Disable "Add New" for activity targets; for junction relations we can create
  const canCreateNew = !isRelationFromActivityTargets;

  // For junction relations, use the target object for "Add New", not the junction object
  const objectMetadataItemIdForCreate =
    isJunctionRelation && isDefined(junctionTargetObjectMetadata)
      ? junctionTargetObjectMetadata.id
      : relationObjectMetadataItem.id;

  return (
    <MultipleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      onSubmit={handleSubmit}
      onChange={(morphItem) => {
        if (isRelationFromActivityTargets) {
          updateActivityTargetFromCell({
            morphItem,
            activityTargetWithTargetRecords: activityTargetObjectRecords,
            recordPickerInstanceId: instanceId,
          });
        } else if (isJunctionRelation && isJunctionConfigValid) {
          updateJunctionRelationFromCell({
            morphItem,
          });
        } else {
          updateRelation(morphItem);
        }
      }}
      onCreate={canCreateNew ? handleCreateNew : undefined}
      objectMetadataItemIdForCreate={objectMetadataItemIdForCreate}
      onClickOutside={handleSubmit}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
