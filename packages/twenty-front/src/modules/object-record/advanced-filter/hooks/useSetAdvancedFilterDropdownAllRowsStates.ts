import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useSetAdvancedFilterDropdownStates = () => {
  const store = useStore();
  const rootLevelRecordFilterGroup = useRecoilComponentSelectorValueV2(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const setAdvancedFilterDropdownStates = useCallback(() => {
    const rootLevelRecordFilters = currentRecordFilters.filter(
      (recordFilter) =>
        recordFilter.recordFilterGroupId === rootLevelRecordFilterGroup?.id,
    );

    const setAdvancedFilterStatesForRecordFilter = (
      recordFilter: RecordFilter,
    ) => {
      const instanceId =
        getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        );

      store.set(
        objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
          instanceId,
        }),
        recordFilter,
      );

      store.set(
        fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
          instanceId,
        }),
        recordFilter.fieldMetadataId,
      );

      store.set(
        subFieldNameUsedInDropdownComponentState.atomFamily({
          instanceId,
        }),
        recordFilter.subFieldName,
      );
    };

    for (const rootLevelRecordFilter of rootLevelRecordFilters) {
      setAdvancedFilterStatesForRecordFilter(rootLevelRecordFilter);
    }

    const childRecordFilterGroups = currentRecordFilterGroups.filter(
      (currentRecordGroupToFilter) =>
        currentRecordGroupToFilter.parentRecordFilterGroupId ===
        rootLevelRecordFilterGroup?.id,
    );

    for (const childRecordFilterGroup of childRecordFilterGroups) {
      const recordFiltersInThisGroup = currentRecordFilters.filter(
        (recordFilter) =>
          recordFilter.recordFilterGroupId === childRecordFilterGroup.id,
      );

      for (const recordFilterInThisGroup of recordFiltersInThisGroup) {
        setAdvancedFilterStatesForRecordFilter(recordFilterInThisGroup);
      }
    }
  }, [
    currentRecordFilterGroups,
    currentRecordFilters,
    rootLevelRecordFilterGroup,
    store,
  ]);

  return {
    setAdvancedFilterDropdownStates,
  };
};
