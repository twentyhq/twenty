import { useState } from 'react';
import { v4 } from 'uuid';

import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useEmptyRecordFilter } from '@/object-record/object-filter-dropdown/hooks/useEmptyRecordFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getActorSourceMultiSelectOptions } from '@/object-record/object-filter-dropdown/utils/getActorSourceMultiSelectOptions';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

type ObjectFilterDropdownSourceSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownSourceSelect = ({
  viewComponentId,
}: ObjectFilterDropdownSourceSelectProps) => {
  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
  );

  const objectFilterDropdownSelectedRecordIds = useRecoilComponentValueV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { applyRecordFilter } = useApplyRecordFilter(viewComponentId);

  const { deleteCombinedViewFilter } =
    useDeleteCombinedViewFilters(viewComponentId);

  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewComponentId);

  // TODO: this should be removed as it is not consistent across re-renders
  const [fieldId] = useState(v4());

  const sourceTypes = getActorSourceMultiSelectOptions(
    objectFilterDropdownSelectedRecordIds,
  );

  const filteredSelectedItems = sourceTypes.filter((option) =>
    objectFilterDropdownSelectedRecordIds.includes(option.id),
  );

  const { emptyRecordFilter } = useEmptyRecordFilter();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, itemToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== itemToSelect.id,
        );

    if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
      throw new Error(
        'Field metadata item used in filter dropdown should be defined',
      );
    }

    if (newSelectedItemIds.length === 0) {
      emptyRecordFilter();
      removeRecordFilter(fieldMetadataItemUsedInFilterDropdown.id);
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
      isDefined(fieldMetadataItemUsedInFilterDropdown) &&
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
            fieldMetadataItemUsedInFilterDropdown.id,
        );

      const filterId = viewFilter?.id ?? fieldId;

      const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
        field: fieldMetadataItemUsedInFilterDropdown,
      });

      applyRecordFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        definition: filterDefinition,
        operand: selectedOperandInDropdown || ViewFilterOperand.Is,
        displayValue: filterDisplayValue,
        fieldMetadataId: fieldMetadataItemUsedInFilterDropdown.id,
        value: newFilterValue,
        viewFilterGroupId: selectedFilter?.viewFilterGroupId,
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
