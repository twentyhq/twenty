import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSetEditableFilterChipDropdownStates = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const setEditableFilterChipDropdownStates = useRecoilCallback(
    ({ set }) =>
      (recordFilter: RecordFilter) => {
        const fieldMetadataItem = filterableFieldMetadataItems.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === recordFilter.fieldMetadataId,
        );

        if (!isDefined(fieldMetadataItem)) {
          return;
        }

        set(
          fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          fieldMetadataItem.id,
        );

        set(
          selectedOperandInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter.operand,
        );

        set(
          objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter,
        );

        set(
          subFieldNameUsedInDropdownComponentState.atomFamily({
            instanceId: recordFilter.id,
          }),
          recordFilter.subFieldName,
        );
      },
    [filterableFieldMetadataItems],
  );

  return {
    setEditableFilterChipDropdownStates,
  };
};
