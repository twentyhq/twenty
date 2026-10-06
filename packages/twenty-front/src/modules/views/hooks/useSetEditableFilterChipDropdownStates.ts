import { setObjectFilterDropdownStatesFromRecordFilter } from '@/object-record/object-filter-dropdown/utils/setObjectFilterDropdownStatesFromRecordFilter';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetEditableFilterChipDropdownStates = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const store = useStore();

  const setEditableFilterChipDropdownStates = useCallback(
    (recordFilter: RecordFilter) => {
      const fieldMetadataItem = filterableFieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordFilter.fieldMetadataId,
      );

      setObjectFilterDropdownStatesFromRecordFilter({
        store,
        objectFilterDropdownInstanceId:
          getEditableChipObjectFilterDropdownComponentInstanceId({
            recordFilterId: recordFilter.id,
          }),
        recordFilter,
        fieldMetadataItemId: fieldMetadataItem?.id,
      });
    },
    [store, filterableFieldMetadataItems],
  );

  return {
    setEditableFilterChipDropdownStates,
  };
};
