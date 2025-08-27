import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useAttachMorphRelatedRecordFromRecord } from '@/object-record/hooks/useAttachMorphRelatedRecordFromRecord';
import { useDetachMorphRelatedRecordFromRecord } from '@/object-record/hooks/useDetachMorphRelatedRecordFromRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateMorphRelationManyToOneFieldInput = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { updateOneRecordAndDetachMorphRelations } =
    useDetachMorphRelatedRecordFromRecord();

  const { updateOneRecordAndAttachMorphRelations } =
    useAttachMorphRelatedRecordFromRecord();

  const updateRelation = useRecoilCallback(
    () =>
      async (
        morphItem: Pick<
          RecordPickerPickableMorphItem,
          'recordId' | 'isSelected'
        >,
      ) => {
        const recordObjectNameSingulars =
          fieldDefinition.metadata.morphRelations.map(
            (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
          );
        if (morphItem.isSelected) {
          await updateOneRecordAndAttachMorphRelations({
            recordId,
            relatedRecordId: morphItem.recordId,
            objectNameSingulars: recordObjectNameSingulars,
          });
        } else {
          await updateOneRecordAndDetachMorphRelations({
            recordId,
            relatedRecordId: morphItem.recordId,
            objectNameSingulars: recordObjectNameSingulars,
          });
        }
      },
    [
      fieldDefinition.metadata.morphRelations,
      recordId,
      updateOneRecordAndAttachMorphRelations,
      updateOneRecordAndDetachMorphRelations,
    ],
  );

  return { updateRelation };
};
