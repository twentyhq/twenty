import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { objectRecordMultiSelectCheckedRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsComponentState';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationManyFieldInput = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.Relation,
    isFieldRelation,
    fieldDefinition,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { updateOneRecordAndDetachRelations } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const fieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (objectRecordId: string) => {
        const previouslyCheckedRecordsIds = snapshot
          .getLoadable(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId,
            }),
          )
          .getValue();

        const isNewlySelected =
          !previouslyCheckedRecordsIds.includes(objectRecordId);
        if (isNewlySelected) {
          set(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId,
            }),
            (prev) => [...prev, objectRecordId],
          );
        } else {
          set(
            objectRecordMultiSelectCheckedRecordsIdsComponentState({
              scopeId,
            }),
            (prev) => prev.filter((id) => id !== objectRecordId),
          );
        }

        if (isNewlySelected) {
          await updateOneRecord({
            idToUpdate: objectRecordId,
            updateOneRecordInput: {
              [`${fieldName}Id`]: entityId,
            },
          });
        } else {
          await updateOneRecordAndDetachRelations({
            recordId: entityId,
            relatedRecordId: objectRecordId,
          });
        }
      },
    [
      entityId,
      fieldName,
      scopeId,
      updateOneRecord,
      updateOneRecordAndDetachRelations,
    ],
  );

  return { handleChange };
};
