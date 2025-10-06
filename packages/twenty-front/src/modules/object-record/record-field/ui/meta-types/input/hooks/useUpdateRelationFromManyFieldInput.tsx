import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationFromManyFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RELATION,
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
    });

  const { updateOneRecordAndAttachRelations } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
    });

  const updateRelation = useRecoilCallback(
    () => async (morphItem: RecordPickerPickableMorphItem) => {
      if (morphItem.isSelected) {
        await updateOneRecordAndAttachRelations({
          recordId,
          relatedRecordId: morphItem.recordId,
          relationTargetgqlfieldName: fieldDefinition.metadata.fieldName,
        });
      } else {
        await updateOneRecordAndDetachRelations({
          recordId,
          relatedRecordId: morphItem.recordId,
          relationTargetgqlfieldName: fieldDefinition.metadata.fieldName,
        });
      }
    },
    [
      fieldDefinition.metadata.fieldName,
      recordId,
      updateOneRecordAndAttachRelations,
      updateOneRecordAndDetachRelations,
    ],
  );

  return { updateRelation };
};
