import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordFilterChipFromTableHeader = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { openDropdown } = useOpenDropdown();

  const { setEditableFilterChipDropdownStates } =
    useSetEditableFilterChipDropdownStates();

  const openRecordFilterChipFromTableHeader = (fieldMetadataItemId: string) => {
    const correspondingFieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItemToFind) =>
        fieldMetadataItemToFind.id === fieldMetadataItemId,
    );

    if (!isDefined(correspondingFieldMetadataItem)) {
      throw new Error(
        `Cannot find field metadata item with id : ${fieldMetadataItemId}`,
      );
    }

    const existingNonAdvancedRecordFilter = currentRecordFilters.find(
      (recordFilter) =>
        recordFilter.fieldMetadataId === fieldMetadataItemId &&
        !isDefined(recordFilter.recordFilterGroupId),
    );

    if (isDefined(existingNonAdvancedRecordFilter)) {
      setEditableFilterChipDropdownStates(existingNonAdvancedRecordFilter);
      openDropdown({
        dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
          recordFilterId: existingNonAdvancedRecordFilter.id,
        }),
      });
      return;
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      correspondingFieldMetadataItem,
    );

    upsertRecordFilter(newRecordFilter);

    setEditableFilterChipDropdownStates(newRecordFilter);
    openDropdown({
      dropdownComponentInstanceIdFromProps: getEditableChipDropdownId({
        recordFilterId: newRecordFilter.id,
      }),
    });
  };

  return { openRecordFilterChipFromTableHeader };
};
