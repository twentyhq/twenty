import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateMultipleRecordsManyToOneObjects } from '@/object-record/hooks/useUpdateMultipleRecordsManyToOneObjects';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const usePersistFieldForMorphRelationManyToOne = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  if (!isFieldMorphRelation(fieldDefinition)) {
    throw new Error('Field is not a morph relation');
  }
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.morphRelations[0].sourceObjectMetadata
        .nameSingular,
  });

  if (!isFieldMorphRelationManyToOne(fieldDefinition)) {
    throw new Error('Field is not a morph relation many to one');
  }

  const objectNameSingulars = fieldDefinition.metadata.morphRelations.map(
    (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
  );

  const { updateMultipleRecordsManyToOneObjects } =
    useUpdateMultipleRecordsManyToOneObjects();

  const persistFieldForMorphRelationManyToOne = useRecoilCallback(
    () =>
      (
        singleRecordPickerRecord: SingleRecordPickerRecord | null | undefined,
      ) => {
        if (!isDefined(singleRecordPickerRecord)) {
          updateMultipleRecordsManyToOneObjects?.([
            {
              idToUpdate: recordId,
              objectNameSingulars,
              relatedRecordId: null,
              objectMetadataItem,
              fieldDefinition,
            },
          ]);
          return;
        }
        const recordFromPicker = singleRecordPickerRecord?.record;

        if (!isDefined(recordFromPicker?.id)) {
          return;
        }

        const updatedManyRecordsArgs = [
          {
            idToUpdate: recordId,
            objectNameSingulars,
            relatedRecordId: recordFromPicker.id,
            objectMetadataItem,
            fieldDefinition,
          },
        ];

        updateMultipleRecordsManyToOneObjects?.(updatedManyRecordsArgs);
      },
    [
      fieldDefinition,
      objectMetadataItem,
      objectNameSingulars,
      recordId,
      updateMultipleRecordsManyToOneObjects,
    ],
  );

  return persistFieldForMorphRelationManyToOne;
};
