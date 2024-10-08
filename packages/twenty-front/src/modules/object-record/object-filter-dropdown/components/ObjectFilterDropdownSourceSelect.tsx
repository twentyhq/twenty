import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { getActorSourceMultiSelectOptions } from '@/object-record/object-filter-dropdown/utils/getActorSourceMultiSelectOptions';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

type ObjectFilterDropdownSourceSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownSourceSelect = ({
  viewComponentId,
}: ObjectFilterDropdownSourceSelectProps) => {
  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedOperandInDropdownState,
    selectedFilterState,
    setObjectFilterDropdownSelectedRecordIds,
    objectFilterDropdownSelectedRecordIdsState,
    selectFilter,
    emptyFilterButKeepDefinition,
  } = useFilterDropdown();

  const { deleteCombinedViewFilter } =
    useDeleteCombinedViewFilters(viewComponentId);

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewComponentId);

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSelectedRecordIds = useRecoilValue(
    objectFilterDropdownSelectedRecordIdsState,
  );
  const [fieldId] = useState(v4());

  const selectedFilter = useRecoilValue(selectedFilterState);

  const sourceTypes = getActorSourceMultiSelectOptions(
    objectFilterDropdownSelectedRecordIds,
  );

  const filteredSelectedItems = sourceTypes.filter((option) =>
    objectFilterDropdownSelectedRecordIds.includes(option.id),
  );

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, itemToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== itemToSelect.id,
        );

    if (newSelectedItemIds.length === 0) {
      emptyFilterButKeepDefinition();
      deleteCombinedViewFilter(fieldId);
      return;
    }

    setObjectFilterDropdownSelectedRecordIds(newSelectedItemIds);

    const selectedItemNames = sourceTypes
      .filter((option) => newSelectedItemIds.includes(option.id))
      .map((option) => option.name);

    const filterDisplayValue =
      selectedItemNames.length > MAX_ITEMS_TO_DISPLAY
        ? `${selectedItemNames.length} source types`
        : selectedItemNames.join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedItemIds.length > 0
          ? JSON.stringify(newSelectedItemIds)
          : EMPTY_FILTER_VALUE;

      const viewFilter =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (viewFilter) =>
            viewFilter.fieldMetadataId ===
            filterDefinitionUsedInDropdown.fieldMetadataId,
        );

      const filterId = viewFilter?.id ?? fieldId;

      selectFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown || ViewFilterOperand.Is,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
      });
    }
  };

  return (
    <MultipleSelectDropdown
      selectableListId="object-filter-source-select-id"
      hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
      itemsToSelect={sourceTypes.filter(
        (item) =>
          !filteredSelectedItems.some((selected) => selected.id === item.id),
      )}
      filteredSelectedItems={filteredSelectedItems}
      selectedItems={filteredSelectedItems}
      onChange={handleMultipleItemSelectChange}
      searchFilter={objectFilterDropdownSearchInput}
      loadingItems={false}
    />
  );
};
