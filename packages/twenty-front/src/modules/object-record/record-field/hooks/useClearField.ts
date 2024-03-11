import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { generateEmptyFieldValueForClear } from '@/object-record/utils/generateEmptyFieldValueForClear';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldRelation } from '../types/guards/isFieldRelation';

export const useClearField = () => {
  const {
    entityId,
    fieldDefinition,
    useUpdateRecord = () => [],
  } = useContext(FieldContext);

  const [updateRecord] = useUpdateRecord();

  const clearField = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const fieldIsRelation = isFieldRelation(fieldDefinition);

        if (fieldIsRelation) {
          const objectMetadataItems = snapshot
            .getLoadable(objectMetadataItemsState())
            .getValue();

          const foundObjectMetadataItem = objectMetadataItems.find(
            (item) =>
              item.nameSingular ===
              fieldDefinition.metadata.objectMetadataNameSingular,
          );

          const foundFieldMetadataItem = foundObjectMetadataItem?.fields.find(
            (field) => field.name === fieldDefinition.metadata.fieldName,
          );

          if (!foundFieldMetadataItem || !foundFieldMetadataItem) {
            throw new Error('Field metadata not found');
          }

          const fieldName = fieldDefinition.metadata.fieldName;

          const emptyRelationFieldValue = generateEmptyFieldValue(
            foundFieldMetadataItem,
          );

          set(
            recordStoreFamilySelector({ recordId: entityId, fieldName }),
            emptyRelationFieldValue,
          );

          updateRecord?.({
            variables: {
              where: { id: entityId },
              updateOneRecordInput: {
                [fieldName]: emptyRelationFieldValue,
              },
            },
          });
        } else {
          const fieldName = fieldDefinition.metadata.fieldName;

          const emptyFieldValue = generateEmptyFieldValueForClear(
            fieldDefinition.type,
          );

          set(
            recordStoreFamilySelector({ recordId: entityId, fieldName }),
            emptyFieldValue,
          );

          updateRecord?.({
            variables: {
              where: { id: entityId },
              updateOneRecordInput: {
                [fieldName]: emptyFieldValue,
              },
            },
          });
        }
      },
    [entityId, fieldDefinition, updateRecord],
  );

  return clearField;
};
