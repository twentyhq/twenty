import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useOpenDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useOpenDropdownFromOutside';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordFilterChipFromTableHeader = () => {
  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { openDropdownFromOutside } = useOpenDropdownFromOutside();

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
      openDropdownFromOutside(existingNonAdvancedRecordFilter.id);
      return;
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      correspondingFieldMetadataItem,
    );

    upsertRecordFilter(newRecordFilter);

    setEditableFilterChipDropdownStates(newRecordFilter);
    openDropdownFromOutside(newRecordFilter.id);
  };

  return { openRecordFilterChipFromTableHeader };
};
