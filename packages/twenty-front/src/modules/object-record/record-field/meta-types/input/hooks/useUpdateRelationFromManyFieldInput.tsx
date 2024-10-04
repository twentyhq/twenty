import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { objectRecordMultiSelectCheckedRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsComponentState';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationFromManyFieldInput = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.Relation,
    isFieldRelation,
    fieldDefinition,
  );

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { updateOneRecordAndDetachRelations } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const { updateOneRecordAndAttachRelations } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const updateRelation = useRecoilCallback(
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
          await updateOneRecordAndAttachRelations({
            recordId,
            relatedRecordId: objectRecordId,
          });
        } else {
          await updateOneRecordAndDetachRelations({
            recordId,
            relatedRecordId: objectRecordId,
          });
        }
      },
    [
      recordId,
      scopeId,
      updateOneRecordAndAttachRelations,
      updateOneRecordAndDetachRelations,
    ],
  );

  return { updateRelation };
};
