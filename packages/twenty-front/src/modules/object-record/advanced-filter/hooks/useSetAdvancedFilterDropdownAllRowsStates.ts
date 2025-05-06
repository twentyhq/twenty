import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback } from 'recoil';

export const useSetAdvancedFilterDropdownStates = () => {
  const rootLevelRecordFilterGroup = useRecoilComponentValueV2(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const setAdvancedFilterDropdownStates = useRecoilCallback(
    ({ set }) =>
      () => {
        const rootLevelRecordFilters = currentRecordFilters.filter(
          (recordFilter) =>
            recordFilter.recordFilterGroupId === rootLevelRecordFilterGroup?.id,
        );

        for (const rootLevelRecordFilter of rootLevelRecordFilters) {
          set(
            objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  rootLevelRecordFilter.id,
                ),
            }),
            rootLevelRecordFilter,
          );

          set(
            fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  rootLevelRecordFilter.id,
                ),
            }),
            rootLevelRecordFilter.fieldMetadataId,
          );
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
            set(
              objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
                instanceId:
                  getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                    recordFilterInThisGroup.id,
                  ),
              }),
              recordFilterInThisGroup,
            );

            set(
              fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
                instanceId:
                  getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                    recordFilterInThisGroup.id,
                  ),
              }),
              recordFilterInThisGroup.fieldMetadataId,
            );
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
