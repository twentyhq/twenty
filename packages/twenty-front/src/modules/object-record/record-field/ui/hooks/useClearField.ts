import { useCallback, useContext } from 'react';
import { useStore } from 'jotai';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

export const useClearField = () => {
  const store = useStore();
  const {
    recordId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const clearField = useCallback(() => {
    const objectMetadataItems = store.get(objectMetadataItemsState.atom);

    const foundObjectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.nameSingular ===
        fieldDefinition.metadata.objectMetadataNameSingular,
    );

    const foundFieldMetadataItem = foundObjectMetadataItem?.fields.find(
      (field) => field.name === fieldDefinition.metadata.fieldName,
    );

    if (!foundObjectMetadataItem || !foundFieldMetadataItem) {
      throw new Error('Field metadata item cannot be found');
    }

    const isRelation =
      foundFieldMetadataItem.type === FieldMetadataType.RELATION ||
      foundFieldMetadataItem.type === FieldMetadataType.MORPH_RELATION;

    const shouldSkipClearingBecauseInvolvesMultipleRecords =
      isRelation &&
      foundFieldMetadataItem.settings?.relationType ===
        RelationType.ONE_TO_MANY;

    if (shouldSkipClearingBecauseInvolvesMultipleRecords) {
      return;
    }

    const fieldName = fieldDefinition.metadata.fieldName;

    const emptyFieldValue = generateEmptyFieldValue({
      fieldMetadataItem: foundFieldMetadataItem,
    });

    store.set(
      recordStoreFamilySelectorV2.selectorFamily({ recordId, fieldName }),
      emptyFieldValue,
    );

    const isManyToOneRelation =
      isRelation &&
      foundFieldMetadataItem.settings?.relationType ===
        RelationType.MANY_TO_ONE;

    const updateFieldName = isManyToOneRelation
      ? getForeignKeyNameFromRelationFieldName(fieldName)
      : fieldName;

    if (isManyToOneRelation) {
      store.set(
        recordStoreFamilySelectorV2.selectorFamily({
          recordId,
          fieldName: updateFieldName,
        }),
        emptyFieldValue,
      );
    }

    updateRecord?.({
      variables: {
        where: { id: recordId },
        updateOneRecordInput: {
          [updateFieldName]: emptyFieldValue,
        },
      },
    });
  }, [recordId, fieldDefinition, store, updateRecord]);

  return clearField;
};
