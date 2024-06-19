import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { objectRecordMultiSelectCheckedRecordsIdsState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsState';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

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

  const fieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (objectRecordId: string) => {
        if (isDefined(objectRecordId)) {
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
            set(
              objectRecordMultiSelectCheckedRecordsIdsState,
              previouslyCheckedRecordsIds.filter((id) => id !== objectRecordId),
            );
          }

          updateOneRecord({
            idToUpdate: objectRecordId,
            updateOneRecordInput: {
              [`${fieldName}Id`]: isNewlySelected ? entityId : null,
            },
          });
        }
      },
    [entityId, fieldName, updateOneRecord],
  );

  return { handleChange };
};
