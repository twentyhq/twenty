import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { isActivityTargetField } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { useRelationField } from '@/object-record/record-field/ui/meta-types/hooks/useRelationField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { CustomError, isDefined } from 'twenty-shared/utils';

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

  const isRelationFromActivityTargets = isActivityTargetField(
    fieldName,
    objectMetadataNameSingular ?? '',
  );

  const isJunctionRelation = hasJunctionConfig(fieldMetadataItem.settings);

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    recordId,
    fieldValue as NoteTarget[] | TaskTarget[],
  );

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { updateJunctionRelationFromCell, isJunctionConfigValid } =
    useUpdateJunctionRelationFromCell({
      fieldMetadataItem,
      fieldDefinition: relationFieldDefinition,
      recordId,
    });

  const junctionConfig =
    isJunctionRelation && isJunctionConfigValid
      ? getJunctionConfig({
          settings: fieldMetadataItem.settings,
          relationObjectMetadataId:
            relationFieldDefinition.metadata.relationObjectMetadataId,
          sourceObjectMetadataId: objectMetadataItem.id,
          objectMetadataItems,
        })
      : null;

  const junctionTargetObjectMetadata = (() => {
    if (!junctionConfig || junctionConfig.isMorphRelation) {
      return undefined;
    }
    const firstTargetField = junctionConfig.targetFields[0];
    return objectMetadataItems.find(
      (item) => item.id === firstTargetField?.relation?.targetObjectMetadata.id,
    );
  })();

  const isMorphJunction = junctionConfig?.isMorphRelation ?? false;

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

  const { createOneRecord: createTargetRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionTargetObjectMetadata?.nameSingular ??
      relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
  });
  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionConfig?.junctionObjectMetadata?.nameSingular ??
      relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
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
        const updatePickerState = (
          newRecordId: string,
          targetObjectMetadataId: string,
          searchableObjectMetadataItems: (typeof relationObjectMetadataItem)[],
        ) => {
          const currentMorphItems = snapshot
            .getLoadable(multipleRecordPickerPickableMorphItemsCallbackState)
            .getValue();

          const newMorphItems = currentMorphItems.concat({
            recordId: newRecordId,
            objectMetadataId: targetObjectMetadataId,
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
            forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
            forcePickableMorphItems: newMorphItems,
          });
        };

        if (
          isJunctionRelation &&
          isDefined(junctionConfig) &&
          !isMorphJunction &&
          isDefined(junctionTargetObjectMetadata)
        ) {
          const { targetFields, sourceField } = junctionConfig;
          const targetField = targetFields[0];

          if (!targetField || !sourceField) {
            return;
          }

          const sourceJoinColumnName = getSourceJoinColumnName({
            sourceField,
            sourceObjectMetadata: objectMetadataItem,
          });

          const targetJoinColumnName = getJoinColumnName(targetField.settings);

          if (!sourceJoinColumnName || !targetJoinColumnName) {
            return;
          }

          const newTargetId = v4();
          const targetPayload = buildRecordLabelPayload({
            id: newTargetId,
            searchInput,
            objectMetadataItem: junctionTargetObjectMetadata,
          });

          await createTargetRecord(targetPayload);

          const newJunctionId = v4();
          const createdJunction = await createJunctionRecord({
            id: newJunctionId,
            [sourceJoinColumnName]: recordId,
            [targetJoinColumnName]: newTargetId,
          });

          if (isDefined(createdJunction)) {
            set(recordStoreFamilyState(recordId), (currentRecord) => {
              if (!isDefined(currentRecord)) {
                return currentRecord;
              }
              const currentFieldValue = currentRecord[fieldName];
              const updatedJunctionRecords = Array.isArray(currentFieldValue)
                ? [...currentFieldValue, createdJunction]
                : [createdJunction];

              return { ...currentRecord, [fieldName]: updatedJunctionRecords };
            });
          }

          updatePickerState(newTargetId, junctionTargetObjectMetadata.id, [
            junctionTargetObjectMetadata,
          ]);
          return;
        }

        const newRecordId =
          await createNewRecordAndOpenRightDrawer?.(searchInput);

        if (isDefined(newRecordId)) {
          updatePickerState(newRecordId, relationObjectMetadataItem.id, [
            relationObjectMetadataItem,
          ]);
        }
      },
    [
      createNewRecordAndOpenRightDrawer,
      createTargetRecord,
      createJunctionRecord,
      fieldName,
      instanceId,
      isMorphJunction,
      isJunctionRelation,
      junctionConfig,
      junctionTargetObjectMetadata,
      multipleRecordPickerPickableMorphItemsCallbackState,
      multipleRecordPickerPerformSearch,
      objectMetadataItem,
      recordId,
      relationObjectMetadataItem,
    ],
  );

  // Disable "Add New" for activity targets and MORPH junction relations
  // (For MORPH, we don't know which object type to create)
  const canCreateNew = !isRelationFromActivityTargets && !isMorphJunction;

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
