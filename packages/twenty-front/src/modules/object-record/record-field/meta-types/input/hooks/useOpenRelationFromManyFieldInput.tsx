import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import {
  FieldRelationFromManyValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilCallback } from 'recoil';

export const useOpenRelationFromManyFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const openRelationFromManyFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        fieldName,
        objectNameSingular,
        recordId,
      }: {
        fieldName: string;
        objectNameSingular: string;
        recordId: string;
      }) => {
        const recordPickerInstanceId = `relation-from-many-field-input-${recordId}`;

        const fieldValue = snapshot
          .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
            recordStoreFamilySelector({
              recordId,
              fieldName,
            }),
          )
          .getValue();

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === objectNameSingular,
        );

        if (!objectMetadataItem) {
          return;
        }

        const pickableMorphItems: RecordPickerPickableMorphItem[] =
          fieldValue.map((record) => {
            return {
              objectMetadataId: objectMetadataItem.id,
              recordId: record.id,
              isSelected: true,
              isMatchingSearchFilter: true,
            };
          });

        for (const record of fieldValue) {
          set(recordStoreFamilyState(record.id), record);
        }

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          pickableMorphItems,
        );

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: recordPickerInstanceId },
          ),
          [objectMetadataItem],
        );

        performSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: [objectMetadataItem],
          forcePickableMorphItems: pickableMorphItems,
        });
      },
    [performSearch],
  );

  return { openRelationFromManyFieldInput };
};
