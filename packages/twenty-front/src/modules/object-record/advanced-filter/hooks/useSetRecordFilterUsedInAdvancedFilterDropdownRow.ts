import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
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
          objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
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
