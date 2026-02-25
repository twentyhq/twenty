import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

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

      if (isDefined(fieldMetadataItem)) {
        store.set(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
              recordFilterId: recordFilter.id,
            }),
          }),
          fieldMetadataItem.id,
        );
      }

      store.set(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
            recordFilterId: recordFilter.id,
          }),
        }),
        recordFilter.operand,
      );

      store.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
            recordFilterId: recordFilter.id,
          }),
        }),
        recordFilter,
      );

      store.set(
        subFieldNameUsedInDropdownComponentState.atomFamily({
          instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
            recordFilterId: recordFilter.id,
          }),
        }),
        recordFilter.subFieldName,
      );
    },
    [store, filterableFieldMetadataItems],
  );

  return {
    setEditableFilterChipDropdownStates,
  };
};
