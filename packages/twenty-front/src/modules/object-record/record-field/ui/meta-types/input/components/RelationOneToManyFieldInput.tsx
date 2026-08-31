import { useCallback, useContext } from 'react';
import { useStore } from 'jotai';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useCreateAndConnectJunctionRecord } from '@/object-record/record-field/ui/hooks/useCreateAndConnectJunctionRecord';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const RelationOneToManyFieldInput = () => {
  const store = useStore();
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { onSubmit } = useContext(FieldInputEventContext);

  const { updateRelation } = useUpdateRelationOneToManyFieldInput();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItem, objectMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    objectMetadataItems,
  });
  if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
    throw new CustomError(
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }
  const handleSubmit = () => {
    onSubmit?.({ skipPersist: true });
  };

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { updateJunctionRelationFromCell, junctionConfig } =
    useUpdateJunctionRelationFromCell({
      fieldMetadataItem,
      fieldDefinition: relationFieldDefinition,
      recordId,
    });

  const isJunctionRelation = junctionConfig?.isValid === true;
  const isInvalidJunctionRelation = junctionConfig?.isValid === false;

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

  const { createNewRecordAndOpenSidePanel } = useAddNewRecordAndOpenSidePanel({
    fieldMetadataItem,
    objectMetadataItem,
    relationObjectMetadataNameSingular:
      relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
    relationObjectMetadataItem,
    relationFieldMetadataItem,
    recordId,
  });

  const junctionObjectMetadataItem =
    objectMetadataItems.find(
      ({ id }) => id === junctionConfig?.junctionObjectMetadata?.id,
    ) ?? relationObjectMetadataItem;

  const { createAndConnectJunctionRecord, loading: isCreatingJunctionRecord } =
    useCreateAndConnectJunctionRecord({
      sourceRecordId: recordId,
      relationFieldMetadataId: fieldMetadataItem.id,
      targetObjectMetadataItem:
        junctionTargetObjectMetadata ?? relationObjectMetadataItem,
      junctionObjectMetadataItem,
    });

  const recordFieldInputLayoutDirection = useAtomComponentStateValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const multipleRecordPickerPickableMorphItemsCallbackState =
    useAtomComponentStateCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      instanceId,
    );
  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const handleCreateNew = useCallback(
    async (searchInput?: string) => {
      const updatePickerState = (
        newRecordId: string,
        targetObjectMetadataId: string,
        searchableObjectMetadataItems: (typeof relationObjectMetadataItem)[],
      ) => {
        const currentMorphItems = store.get(
          multipleRecordPickerPickableMorphItemsCallbackState,
        );

        const newMorphItems = currentMorphItems.concat({
          recordId: newRecordId,
          objectMetadataId: targetObjectMetadataId,
          isSelected: true,
          isMatchingSearchFilter: true,
        });

        store.set(
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
        const newTargetId = await createAndConnectJunctionRecord(searchInput);

        if (isDefined(newTargetId)) {
          updatePickerState(newTargetId, junctionTargetObjectMetadata.id, [
            junctionTargetObjectMetadata,
          ]);
        }
        return;
      }

      const newRecordId = await createNewRecordAndOpenSidePanel?.(searchInput);

      if (isDefined(newRecordId)) {
        updatePickerState(newRecordId, relationObjectMetadataItem.id, [
          relationObjectMetadataItem,
        ]);
      }
    },
    [
      createNewRecordAndOpenSidePanel,
      createAndConnectJunctionRecord,
      instanceId,
      isMorphJunction,
      isJunctionRelation,
      junctionConfig,
      junctionTargetObjectMetadata,
      multipleRecordPickerPickableMorphItemsCallbackState,
      multipleRecordPickerPerformSearch,
      relationObjectMetadataItem,
      store,
    ],
  );

  // For MORPH junctions, we don't know which object type to create.
  const canCreateNew = !isMorphJunction;

  // For junction relations, use the target object for "Add New", not the junction object
  const objectMetadataItemIdForCreate =
    isJunctionRelation && isDefined(junctionTargetObjectMetadata)
      ? junctionTargetObjectMetadata.id
      : relationObjectMetadataItem.id;

  if (isInvalidJunctionRelation) {
    return null;
  }

  return (
    <MultipleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      onSubmit={handleSubmit}
      onChange={(morphItem) => {
        if (isJunctionRelation) {
          updateJunctionRelationFromCell({
            morphItem,
          });
        } else {
          updateRelation(morphItem);
        }
      }}
      onCreate={canCreateNew ? handleCreateNew : undefined}
      isCreatePending={isCreatingJunctionRecord}
      objectMetadataItemIdForCreate={objectMetadataItemIdForCreate}
      onClickOutside={handleSubmit}
      layoutDirection={
        recordFieldInputLayoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
