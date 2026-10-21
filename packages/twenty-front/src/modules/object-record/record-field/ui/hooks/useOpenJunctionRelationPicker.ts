import { useStore } from 'jotai';
import { useCallback } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getJunctionRelationPickerData } from '@/object-record/record-field/ui/utils/junction/getJunctionRelationPickerData';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useOpenJunctionRelationPicker = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const store = useStore();

  const openJunctionRelationPicker = useCallback(
    ({
      recordPickerInstanceId,
      junctionRecords,
      targetFields,
    }: {
      recordPickerInstanceId: string;
      junctionRecords: ObjectRecord[] | undefined | null;
      targetFields: FieldMetadataItem[];
    }) => {
      const { pickableMorphItems, searchableObjectMetadataItems } =
        getJunctionRelationPickerData({
          junctionRecords,
          targetFields,
          objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
        });

      store.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: recordPickerInstanceId,
        }),
        pickableMorphItems,
      );

      store.set(
        multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
          { instanceId: recordPickerInstanceId },
        ),
        searchableObjectMetadataItems,
      );

      store.set(
        multipleRecordPickerSearchFilterComponentState.atomFamily({
          instanceId: recordPickerInstanceId,
        }),
        '',
      );

      openMultipleRecordPicker(recordPickerInstanceId);

      performSearch({
        multipleRecordPickerInstanceId: recordPickerInstanceId,
        forceSearchFilter: '',
        forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
        forcePickableMorphItems: pickableMorphItems,
      });
    },
    [openMultipleRecordPicker, performSearch, store],
  );

  return { openJunctionRelationPicker };
};
