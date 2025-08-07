import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';

export const useSetAdvancedFilterDropdownStates = () => {
  const rootLevelRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const setAdvancedFilterDropdownStates = useRecoilCallback(
    ({ set }) =>
      () => {
        const rootLevelRecordFilters = currentRecordFilters.filter(
          (recordFilter) =>
            recordFilter.recordFilterGroupId === rootLevelRecordFilterGroup?.id,
        );

        const setAdvancedFilterStatesForRecordFilter = (
          recordFilter: RecordFilter,
        ) => {
          set(
            objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  recordFilter.id,
                ),
            }),
            recordFilter,
          );

          set(
            fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  recordFilter.id,
                ),
            }),
            recordFilter.fieldMetadataId,
          );

          set(
            subFieldNameUsedInDropdownComponentState.atomFamily({
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  recordFilter.id,
                ),
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
      },
    [
      currentRecordFilterGroups,
      currentRecordFilters,
      rootLevelRecordFilterGroup,
    ],
  );

  return {
    setAdvancedFilterDropdownStates,
  };
};
