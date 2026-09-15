import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useStore } from 'jotai';

export const useOpenFormMultiRecordPicker = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const store = useStore();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const openFormMultiRecordPicker = ({
    pickerInstanceId,
    selectedRecordIds,
    selectedRecords,
  }: {
    pickerInstanceId: string;
    selectedRecordIds: string[];
    selectedRecords: ObjectRecord[];
  }) => {
    openMultipleRecordPicker(pickerInstanceId);

    const pickableMorphItems: RecordPickerPickableMorphItem[] =
      selectedRecordIds.map((recordId) => ({
        objectMetadataId: objectMetadataItem.id,
        recordId,
        isSelected: true,
        isMatchingSearchFilter: true,
      }));

    for (const record of selectedRecords) {
      store.set(recordStoreFamilyState.atomFamily(record.id), record);
    }

    store.set(
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
        instanceId: pickerInstanceId,
      }),
      pickableMorphItems,
    );

    store.set(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
        { instanceId: pickerInstanceId },
      ),
      [objectMetadataItem],
    );

    performSearch({
      multipleRecordPickerInstanceId: pickerInstanceId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: [objectMetadataItem],
      forcePickableMorphItems: pickableMorphItems,
    });
  };

  return { openFormMultiRecordPicker };
};
