import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { objectRecordMultiSelectCheckedRecordsIdsState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsState';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationManyFieldInput = () => {
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

  const { updateOneRecordAndDetachRelations } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular: fieldDefinition.metadata
        .objectMetadataNameSingular as string,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const fieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (objectRecordId: string) => {
        const previouslyCheckedRecordsIds = snapshot
          .getLoadable(objectRecordMultiSelectCheckedRecordsIdsState)
          .getValue();

        const isNewlySelected =
          !previouslyCheckedRecordsIds.includes(objectRecordId);
        if (isNewlySelected) {
          set(objectRecordMultiSelectCheckedRecordsIdsState, (prev) => [
            ...prev,
            objectRecordId,
          ]);
        } else {
          set(objectRecordMultiSelectCheckedRecordsIdsState, (prev) =>
            prev.filter((id) => id !== objectRecordId),
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
    [entityId, fieldName, updateOneRecord, updateOneRecordAndDetachRelations],
  );

  return { handleChange };
};
