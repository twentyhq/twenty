import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useSetRecordFilterUsedInAdvancedFilterDropdownRow = () => {
  const store = useStore();
  const setRecordFilterUsedInAdvancedFilterDropdownRow = useCallback(
    (recordFilter: RecordFilter) => {
      const advancedFilterRowObjectFilterDropdownComponentInstanceId =
        getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        );

      store.set(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter.fieldMetadataId,
      );

      store.set(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter.operand,
      );

      store.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter,
      );
    },
    [store],
  );

  return {
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  };
};
