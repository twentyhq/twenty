import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilCallback } from 'recoil';

export const useSetRecordFilterUsedInAdvancedFilterDropdownRow = () => {
  const setRecordFilterUsedInAdvancedFilterDropdownRow = useRecoilCallback(
    ({ set }) =>
      (recordFilter: RecordFilter) => {
        const advancedFilterRowObjectFilterDropdownComponentInstanceId =
          getAdvancedFilterObjectFilterDropdownComponentInstanceId(
            recordFilter.id,
          );

        set(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId:
              advancedFilterRowObjectFilterDropdownComponentInstanceId,
          }),
          recordFilter.fieldMetadataId,
        );

        set(
          selectedOperandInDropdownComponentState.atomFamily({
            instanceId:
              advancedFilterRowObjectFilterDropdownComponentInstanceId,
          }),
          recordFilter.operand,
        );

        set(
          selectedFilterComponentState.atomFamily({
            instanceId:
              advancedFilterRowObjectFilterDropdownComponentInstanceId,
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
