import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecordOneToManyFieldAttachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldAttachTargetRecord';
import { useRecordOneToManyFieldDetachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldDetachTargetRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateMorphRelationOneToManyFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { recordOneToManyFieldDetachTargetRecord } =
    useRecordOneToManyFieldDetachTargetRecord();

  const { recordOneToManyFieldAttachTargetRecord } =
    useRecordOneToManyFieldAttachTargetRecord();

  const updateMorphRelationOneToMany = useRecoilCallback(
    () =>
      async (
        morphItem: Pick<
          RecordPickerPickableMorphItem,
          'recordId' | 'isSelected'
        >,
      ) => {
        if (!fieldDefinition.metadata.objectMetadataNameSingular) {
          throw new Error('ObjectMetadataNameSingular is required');
        }

        // const recordObjectNameSingulars =
        //   fieldDefinition.metadata.morphRelations.map(
        //     (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
        //   );
        if (morphItem.isSelected) {
          await recordOneToManyFieldAttachTargetRecord({
            sourceObjectNameSingular:
              fieldDefinition.metadata.objectMetadataNameSingular,
            targetObjectNameSingular:
              fieldDefinition.metadata.morphRelations[0].targetObjectMetadata
                .nameSingular,
            targetGQLFieldName:
              fieldDefinition.metadata.morphRelations[0].targetFieldMetadata
                .name,
            sourceRecordId: recordId,
            targetRecordId: morphItem.recordId,
          });
        } else {
          await recordOneToManyFieldDetachTargetRecord({
            sourceObjectNameSingular:
              fieldDefinition.metadata.objectMetadataNameSingular,
            targetObjectNameSingular:
              fieldDefinition.metadata.morphRelations[0].targetObjectMetadata
                .nameSingular,
            targetGQLFieldName:
              fieldDefinition.metadata.morphRelations[0].targetFieldMetadata
                .name,
            sourceRecordId: recordId,
            targetRecordId: morphItem.recordId,
          });
        }
      },
    [
      fieldDefinition.metadata.morphRelations,
      fieldDefinition.metadata.objectMetadataNameSingular,
      recordId,
      recordOneToManyFieldAttachTargetRecord,
      recordOneToManyFieldDetachTargetRecord,
    ],
  );

  return { updateMorphRelationOneToMany };
};
