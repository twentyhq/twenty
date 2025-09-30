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
  const { fieldDefinition, recordId } = useContext(FieldContext); // ba1 pet tob2
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

  const { updateMultipleRecordsFromManyObjects } =
    useUpdateMultipleRecordsManyToOneObjects();

  const persistFieldForMorphRelationManyToOne = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        singleRecordPickerRecord: SingleRecordPickerRecord | null | undefined,
      ) => {
        if (!isDefined(singleRecordPickerRecord)) {
          updateMultipleRecordsFromManyObjects?.([
            {
              idToUpdate: recordId,
              objectNameSingulars,
              relatedRecordId: null,
              objectMetadataItem,
            },
          ]);
        }
        const recordFromPicker = singleRecordPickerRecord?.record; // be0f rocket2

        if (!isDefined(recordFromPicker?.id)) {
          return;
        }

        // todo @guillim
        // const fieldName = fieldDefinition.metadata.fieldName;

        // const currentValue: any = snapshot
        //   .getLoadable(
        //     recordStoreFamilySelector({
        //       recordId: recordFromPicker.id,
        //       fieldName,
        //     }),
        //   )
        //   .getValue();
        // console.log('currentValue', currentValue);
        // if (isDeeplyEqual(valueToPersist, currentValue)) {
        //   return;
        // }

        // set(
        //   recordStoreFamilySelector({ recordId:  recordFromPicker.id, fieldName }),
        //    recordFromPicker,
        // );

        const updatedManyRecordsArgs = [
          {
            idToUpdate: recordId,
            objectNameSingulars,
            relatedRecordId: recordFromPicker.id,
            objectMetadataItem,
          },
        ];

        updateMultipleRecordsFromManyObjects?.(updatedManyRecordsArgs);
      },
    [
      objectMetadataItem,
      objectNameSingulars,
      recordId,
      updateMultipleRecordsFromManyObjects,
    ],
  );

  return persistFieldForMorphRelationManyToOne;
};
