import { useRecoilCallback } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useUpdateMultipleRecordsFromManyObjects } from '@/object-record/hooks/useUpdateMultipleRecordsFromManyObjects';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const usePersistFieldForMorphRelationManyToOne = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  if (!isFieldMorphRelationManyToOne(fieldDefinition)) {
    throw new Error('Field is not a morph relation many to one');
  }

  const objectNameSingulars = fieldDefinition.metadata.morphRelations.map(
    (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
  );

  const { updateMultipleRecordsFromManyObjects } =
    useUpdateMultipleRecordsFromManyObjects();

  const persistFieldForMorphRelationManyToOne = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        singleRecordPickerRecord: SingleRecordPickerRecord | null | undefined,
      ) => {
        if (!isDefined(singleRecordPickerRecord)) {
          console.log(
            'record is null we must unseelct the record (todo @guillim)',
          );
          return;
        }
        const { record } = singleRecordPickerRecord;
        // const fieldIsMorphRelationManyToOneObject =
        //   isFieldMorphRelationManyToOne(fieldDefinition) &&
        //   isFieldRelationToOneValue(valueToPersist);

        const fieldName = fieldDefinition.metadata.fieldName;

        const currentValue: any = snapshot
          .getLoadable(
            recordStoreFamilySelector({ recordId: record.id, fieldName }),
          )
          .getValue();

        // if (isDeeplyEqual(valueToPersist, currentValue)) {
        //   return;
        // }

        set(
          recordStoreFamilySelector({ recordId: record.id, fieldName }),
          record,
        );

        console.log('recordId', recordId);
        console.log('record.id', record.id);
        const updatedManyRecordsArgs = [
          {
            idToUpdate: recordId,
            objectNameSingulars,
            relatedRecordId: record.id,
          },
        ];

        updateMultipleRecordsFromManyObjects?.(updatedManyRecordsArgs);
      },
    [
      fieldDefinition.metadata.fieldName,
      objectNameSingulars,
      recordId,
      updateMultipleRecordsFromManyObjects,
    ],
  );

  return persistFieldForMorphRelationManyToOne;
};
