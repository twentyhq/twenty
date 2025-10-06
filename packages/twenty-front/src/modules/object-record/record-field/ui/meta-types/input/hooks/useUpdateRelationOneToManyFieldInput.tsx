import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecordOneToManyFieldAttachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldAttachTargetRecord';
import { useRecordOneToManyFieldDetachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldDetachTargetRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationOneToManyFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { recordOneToManyFieldDetachTargetRecord } =
    useRecordOneToManyFieldDetachTargetRecord();

  const { recordOneToManyFieldAttachTargetRecord } =
    useRecordOneToManyFieldAttachTargetRecord();

  const updateRelation = useRecoilCallback(
    () => async (morphItem: RecordPickerPickableMorphItem) => {
      if (
        !fieldDefinition.metadata?.relationObjectMetadataNameSingular ||
        !fieldDefinition.metadata?.targetFieldMetadataName
      ) {
        throw new Error('RelationObjectMetadataNameSingular is required');
      }

      if (!fieldDefinition.metadata?.objectMetadataNameSingular) {
        throw new Error('RelationFieldMetadata is required');
      }

      if (morphItem.isSelected) {
        await recordOneToManyFieldAttachTargetRecord({
          sourceObjectNameSingular:
            fieldDefinition.metadata.objectMetadataNameSingular,
          targetObjectNameSingular:
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          targetGQLFieldName: fieldDefinition.metadata.targetFieldMetadataName,
          sourceRecordId: recordId,
          targetRecordId: morphItem.recordId,
        });
      } else {
        await recordOneToManyFieldDetachTargetRecord({
          sourceObjectNameSingular:
            fieldDefinition.metadata.objectMetadataNameSingular,
          targetObjectNameSingular:
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          targetGQLFieldName: fieldDefinition.metadata.targetFieldMetadataName,
          sourceRecordId: recordId,
          targetRecordId: morphItem.recordId,
        });
      }
    },
    [
      fieldDefinition.metadata.objectMetadataNameSingular,
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
      fieldDefinition.metadata.targetFieldMetadataName,
      recordId,
      recordOneToManyFieldAttachTargetRecord,
      recordOneToManyFieldDetachTargetRecord,
    ],
  );

  return { updateRelation };
};
