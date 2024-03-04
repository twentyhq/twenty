import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { generateEmptyFieldValueForClear } from '@/object-record/utils/generateEmptyFieldValueForClear';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
    ({ set }) =>
      () => {
        const fieldIsRelation = isFieldRelation(fieldDefinition);

        if (fieldIsRelation) {
          const fieldName = fieldDefinition.metadata.fieldName;

          const many =
            fieldDefinition.metadata.relationType === 'TO_MANY_OBJECTS';

          const targetNameSingular =
            fieldDefinition.metadata.relationObjectMetadataNameSingular;

          const emptyRelationFieldValue = generateEmptyFieldValueForClear(
            FieldMetadataType.Relation,
            many ? 'Many' : 'Single',
            targetNameSingular,
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
