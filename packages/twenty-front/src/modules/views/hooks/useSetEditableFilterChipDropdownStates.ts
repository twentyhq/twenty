import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getEditableChipObjectFilterDropdownComponentInstanceId } from '@/views/editable-chip/utils/getEditableChipObjectFilterDropdownComponentInstanceId';
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

        if (isDefined(fieldMetadataItem)) {
          set(
            fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
              instanceId:
                getEditableChipObjectFilterDropdownComponentInstanceId({
                  recordFilterId: recordFilter.id,
                }),
            }),
            fieldMetadataItem.id,
          );
        }

        set(
          selectedOperandInDropdownComponentState.atomFamily({
            instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
              recordFilterId: recordFilter.id,
            }),
          }),
          recordFilter.operand,
        );

        set(
          objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
            instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
              recordFilterId: recordFilter.id,
            }),
          }),
          recordFilter,
        );

        set(
          subFieldNameUsedInDropdownComponentState.atomFamily({
            instanceId: getEditableChipObjectFilterDropdownComponentInstanceId({
              recordFilterId: recordFilter.id,
            }),
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
