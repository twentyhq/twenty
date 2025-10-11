import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRelationObjectMetadataNameSingular } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/display';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  recordFilterId?: string;
  dropdownId: string;
};

export const ObjectFilterDropdownRecordSelect = ({
  recordFilterId,
  dropdownId,
}: ObjectFilterDropdownRecordSelectProps) => {
  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { isCurrentWorkspaceMemberSelected } = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
        objectFilterDropdownFilterValue,
      ),
    })
    .parse(objectFilterDropdownFilterValue);

  if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
    throw new Error('fieldMetadataItemUsedInFilterDropdown is not defined');
  }

  const objectNameSingular = getRelationObjectMetadataNameSingular({
    field: fieldMetadataItemUsedInFilterDropdown,
  });

  if (!isDefined(objectNameSingular)) {
    throw new Error('relationObjectMetadataNameSingular is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectLabelPlural = objectMetadataItem?.labelPlural;

  if (!isDefined(objectNameSingular)) {
    throw new Error('objectNameSingular is not defined');
  }

  const firstSimpleRecordFilterForFieldMetadataItemUsedInDropdown =
    currentRecordFilters.find(
      (filter) =>
        filter.fieldMetadataId === fieldMetadataItemUsedInFilterDropdown?.id &&
        !isDefined(filter.recordFilterGroupId),
    );

  const recordFilterPassedInProps = currentRecordFilters.find(
    (filter) => filter.id === recordFilterId,
  );

  const recordFilterUsedInDropdown = isDefined(recordFilterId)
    ? recordFilterPassedInProps
    : firstSimpleRecordFilterForFieldMetadataItemUsedInDropdown;

  const { selectedRecordIds } = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
        recordFilterUsedInDropdown?.value,
      ),
    })
    .parse(recordFilterUsedInDropdown?.value);

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: selectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const currentWorkspaceMemberSelectableItem: SelectableItem = {
    id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
    name: 'Me',
    isSelected: isCurrentWorkspaceMemberSelected ?? false,
    AvatarIcon: IconUserCircle,
  };

  const pinnedSelectableItems: SelectableItem[] =
    objectNameSingular === 'workspaceMember'
      ? [currentWorkspaceMemberSelectableItem]
      : [];

  const filteredPinnedSelectableItems = pinnedSelectableItems.filter((item) =>
    item.name
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const handleMultipleRecordSelectChange = (
    itemToSelect: SelectableItem,
    isNewSelectedValue: boolean,
  ) => {
    if (loading) {
      return;
    }

    const isItemCurrentWorkspaceMember =
      itemToSelect.id === CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID;

    const selectedRecordIdsWithAddedRecord = [
      ...selectedRecordIds,
      itemToSelect.id,
    ];

    const selectedRecordIdsWithRemovedRecord = selectedRecordIds.filter(
      (id) => id !== itemToSelect.id,
    );

    const newSelectedRecordIds = isItemCurrentWorkspaceMember
      ? selectedRecordIds
      : isNewSelectedValue
        ? selectedRecordIdsWithAddedRecord
        : selectedRecordIdsWithRemovedRecord;

    const newIsCurrentWorkspaceMemberSelected = isItemCurrentWorkspaceMember
      ? isNewSelectedValue
      : isCurrentWorkspaceMemberSelected;

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

    const selectedPinnedItemNames = newIsCurrentWorkspaceMemberSelected
      ? [currentWorkspaceMemberSelectableItem.name]
      : [];

    const selectedItemNames = [
      ...selectedPinnedItemNames,
      ...selectedRecordNames,
    ];

    const filterDisplayValue =
      selectedItemNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedItemNames.length} ${objectLabelPlural.toLowerCase()}`
        : selectedItemNames.join(', ');

    if (isDefined(selectedOperandInDropdown)) {
      const newFilterValue =
        newSelectedRecordIds.length > 0 || newIsCurrentWorkspaceMemberSelected
          ? JSON.stringify({
              isCurrentWorkspaceMemberSelected:
                newIsCurrentWorkspaceMemberSelected,
              selectedRecordIds: newSelectedRecordIds,
            } satisfies RelationFilterValue)
          : '';

      applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);
    }
  };

  return (
    <>
      {filteredPinnedSelectableItems.length > 0 && (
        <>
          <ObjectFilterDropdownRecordPinnedItems
            selectableItems={filteredPinnedSelectableItems}
            onChange={handleMultipleRecordSelectChange}
          />
          <DropdownMenuSeparator />
        </>
      )}
      <MultipleSelectDropdown
        selectableListId="object-filter-record-select-id"
        focusId={dropdownId}
        itemsToSelect={recordsToSelect}
        filteredSelectedItems={filteredSelectedRecords}
        selectedItems={selectedRecords}
        onChange={handleMultipleRecordSelectChange}
        searchFilter={objectFilterDropdownSearchInput}
        loadingItems={loading}
      />
    </>
  );
};
