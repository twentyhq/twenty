import { type CalendarEventComposerTarget } from '@/activities/calendar/types/CalendarEventComposerTarget';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useOpenCalendarEventTargetsPicker = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const openCalendarEventTargetsPicker = ({
    pickerInstanceId,
    searchableObjectMetadataItems,
    targets,
  }: {
    pickerInstanceId: string;
    searchableObjectMetadataItems: EnrichedObjectMetadataItem[];
    targets: CalendarEventComposerTarget[];
  }) => {
    openMultipleRecordPicker(pickerInstanceId);

    const pickableMorphItems: RecordPickerPickableMorphItem[] = targets.map(
      ({ objectMetadataId, recordId }) => ({
        objectMetadataId,
        recordId,
        isSelected: true,
        isMatchingSearchFilter: true,
      }),
    );

    for (const { record } of targets) {
      store.set(recordStoreFamilyState.atomFamily(record.id), record);
    }

    store.set(
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
        instanceId: pickerInstanceId,
        surfaceId,
      }),
      pickableMorphItems,
    );

    store.set(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
        { instanceId: pickerInstanceId, surfaceId },
      ),
      searchableObjectMetadataItems,
    );

    performSearch({
      multipleRecordPickerInstanceId: pickerInstanceId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
      forcePickableMorphItems: pickableMorphItems,
    });
  };

  return { openCalendarEventTargetsPicker };
};
