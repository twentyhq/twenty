import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useAttachMorphRelatedRecordFromRecord } from '@/object-record/hooks/useAttachMorphRelatedRecordFromRecord';
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

  // todo @guillim
  // const { updateOneRecordAndDetachRelations } =
  //   useDetachRelatedRecordFromRecord({
  //     recordObjectNameSingular:
  //       fieldDefinition.metadata.objectMetadataNameSingular,
  //     fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
  //   });

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
        console.log(
          'AFTER CLICK morphItem',
          morphItem,
          '-',
          recordId,
          fieldDefinition,
        );

        if (morphItem.isSelected) {
          const recordObjectNameSingulars =
            fieldDefinition.metadata.morphRelations.map(
              (morphRelation) =>
                morphRelation.targetObjectMetadata.nameSingular,
            );
          const fieldNameOnRecordObject = fieldDefinition.metadata.fieldName;
          await updateOneRecordAndAttachMorphRelations({
            recordId,
            relatedRecordId: morphItem.recordId,
            objectNameSingulars: recordObjectNameSingulars,
          });
        } else {
          console.log('todo');
          // await updateOneRecordAndDetachRelations({
          //   recordId,
          //   relatedRecordId: morphItem.recordId,
          // });
        }
      },
    [
      recordId,
      updateOneRecordAndAttachMorphRelations,
      // updateOneRecordAndDetachRelations,
    ],
  );

  return { updateRelation };
};
