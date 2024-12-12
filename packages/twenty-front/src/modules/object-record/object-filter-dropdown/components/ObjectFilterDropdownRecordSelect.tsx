import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { relationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/relationFilterValueSchema';
import { IconUserCircle } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownRecordSelect = ({
  viewComponentId,
}: ObjectFilterDropdownRecordSelectProps) => {
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

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
    relationFilterValueSchema
      .catch({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [],
      })
      .parse(selectedFilter?.value);

  const objectNameSingular =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNameSingular;

  if (!isDefined(objectNameSingular)) {
    throw new Error('objectNameSingular is not defined');
  }

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: objectFilterDropdownSelectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const handleMultipleRecordSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    if (loading) {
      return;
    }

    const newSelectedRecordIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, itemToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== itemToSelect.id,
        );

    if (newSelectedRecordIds.length === 0) {
      emptyFilterButKeepDefinition();
      deleteCombinedViewFilter(fieldId);
      return;
    }

    setObjectFilterDropdownSelectedRecordIds(newSelectedRecordIds);

    const selectedRecordNames = [
      ...recordsToSelect,
      ...selectedRecords,
      ...filteredSelectedRecords,
    ]
      .filter(
        (record, index, self) =>
          self.findIndex((r) => r.id === record.id) === index,
      )
      .filter((record) => newSelectedRecordIds.includes(record.id))
      .map((record) => record.name);

    const filterDisplayValue =
      selectedRecordNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedRecordNames.length} companies`
        : selectedRecordNames.join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedRecordIds.length > 0
          ? JSON.stringify({
              isCurrentWorkspaceMemberSelected:
                itemToSelect.id === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
              selectedRecordIds: newSelectedRecordIds,
            } satisfies RelationFilterValue)
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
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
        viewFilterGroupId: selectedFilter?.viewFilterGroupId,
      });
    }
  };

  const itemsToSelect: SelectableItem[] = [
    ...(objectNameSingular === 'workspaceMember'
      ? [
          {
            id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
            name: 'Me',
            isSelected: isCurrentWorkspaceMemberSelected,
            AvatarIcon: IconUserCircle,
          },
        ]
      : []),
    ...recordsToSelect,
  ];

  return (
    <MultipleSelectDropdown
      selectableListId="object-filter-record-select-id"
      hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
      itemsToSelect={itemsToSelect}
      filteredSelectedItems={filteredSelectedRecords}
      selectedItems={selectedRecords}
      onChange={handleMultipleRecordSelectChange}
      searchFilter={objectFilterDropdownSearchInput}
      loadingItems={loading}
    />
  );
};
