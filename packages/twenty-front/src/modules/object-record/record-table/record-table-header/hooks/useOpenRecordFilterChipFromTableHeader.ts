import { useSelectFilterUsedInDropdown } from '@/object-record/object-filter-dropdown/hooks/useSelectFilterUsedInDropdown';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useFilterableFieldMetadataItemsInRecordIndexContext } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useOpenDropdownFromOutside';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetEditableFilterChipDropdownStates } from '@/views/hooks/useSetEditableFilterChipDropdownStates';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordFilterChipFromTableHeader = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { filterableFieldMetadataItems } =
    useFilterableFieldMetadataItemsInRecordIndexContext();

  const { selectFilterUsedInDropdown } =
    useSelectFilterUsedInDropdown(recordIndexId);

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

    const existingRecordFilter = currentRecordFilters.find(
      (recordFilter) => recordFilter.fieldMetadataId === fieldMetadataItemId,
    );

    if (isDefined(existingRecordFilter)) {
      setEditableFilterChipDropdownStates(existingRecordFilter);
      openDropdownFromOutside(existingRecordFilter.id);
      return;
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      correspondingFieldMetadataItem,
    );

    upsertRecordFilter(newRecordFilter);

    selectFilterUsedInDropdown({ fieldMetadataItemId });

    setEditableFilterChipDropdownStates(newRecordFilter);
    openDropdownFromOutside(newRecordFilter.id);
  };

  return { openRecordFilterChipFromTableHeader };
};
