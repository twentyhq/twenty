import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordOneToManyFieldAttachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldAttachTargetRecord';
import { useRecordOneToManyFieldDetachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldDetachTargetRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationOneToManyFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );

  const { objectMetadataItem: targetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  if (!isDefined(fieldDefinition.metadata.objectMetadataNameSingular)) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
    });

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  if (!isDefined(targetObjectMetadataItem)) {
    throw new Error('TargetObjectMetadataItem is required');
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

      const targetFieldMetadata = targetObjectMetadataItem.fields.find(
        (field) =>
          field.name === fieldDefinition.metadata.targetFieldMetadataName,
      );

      if (!isDefined(targetFieldMetadata)) {
        throw new Error('TargetFieldMetadata is required');
      }

      let targetGQLFieldName: string;
      if (targetFieldMetadata.type === FieldMetadataType.MORPH_RELATION) {
        targetGQLFieldName = computeMorphRelationFieldName({
          fieldName: fieldDefinition.metadata.targetFieldMetadataName,
          relationType: targetFieldMetadata.settings?.relationType,
          targetObjectMetadataNameSingular:
            sourceObjectMetadataItem.nameSingular,
          targetObjectMetadataNamePlural: sourceObjectMetadataItem.namePlural,
        });
      } else {
        targetGQLFieldName = fieldDefinition.metadata.targetFieldMetadataName;
      }

      if (morphItem.isSelected) {
        await recordOneToManyFieldAttachTargetRecord({
          sourceObjectNameSingular:
            fieldDefinition.metadata.objectMetadataNameSingular,
          targetObjectNameSingular:
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          targetGQLFieldName,
          sourceRecordId: recordId,
          targetRecordId: morphItem.recordId,
        });
      } else {
        await recordOneToManyFieldDetachTargetRecord({
          sourceObjectNameSingular:
            fieldDefinition.metadata.objectMetadataNameSingular,
          targetObjectNameSingular:
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          targetGQLFieldName,
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
      sourceObjectMetadataItem.namePlural,
      sourceObjectMetadataItem.nameSingular,
      targetObjectMetadataItem.fields,
    ],
  );

  return { updateRelation };
};
