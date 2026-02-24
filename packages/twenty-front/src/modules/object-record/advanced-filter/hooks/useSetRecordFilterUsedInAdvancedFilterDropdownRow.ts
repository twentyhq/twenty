import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useSetRecordFilterUsedInAdvancedFilterDropdownRow = () => {
  const setRecordFilterUsedInAdvancedFilterDropdownRow = useCallback(
    (recordFilter: RecordFilter) => {
      const advancedFilterRowObjectFilterDropdownComponentInstanceId =
        getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        );

      jotaiStore.set(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter.fieldMetadataId,
      );

      jotaiStore.set(
        selectedOperandInDropdownComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter.operand,
      );

      jotaiStore.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId: advancedFilterRowObjectFilterDropdownComponentInstanceId,
        }),
        recordFilter,
      );
    },
    [],
  );

  return {
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  };
};
