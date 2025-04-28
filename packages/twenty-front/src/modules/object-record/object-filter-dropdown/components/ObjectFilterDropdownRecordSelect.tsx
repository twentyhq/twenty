import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  getFilterTypeFromFieldType,
  getRelationObjectMetadataNameSingular,
} from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { relationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/relationFilterValueSchema';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const EMPTY_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownRecordSelectProps = {
  viewComponentId?: string;
  recordFilterId?: string;
};

export const ObjectFilterDropdownRecordSelect = ({
  viewComponentId,
  recordFilterId,
}: ObjectFilterDropdownRecordSelectProps) => {
  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter(viewComponentId);

  const { id: currentWorkspaceMemberId } =
    useRecoilValue(currentWorkspaceMemberState) ?? {};

  let isCurrentWorkspaceMemberSelected: boolean;
  let selectedRecordIds: string[];

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

  try {
    const relationFilterValue = relationFilterValueSchema.parse(
      recordFilterUsedInDropdown?.value,
    );

    isCurrentWorkspaceMemberSelected = relationFilterValue.includes(
      '{{CURRENT_WORKSPACE_MEMBER}}',
    );
    selectedRecordIds = relationFilterValue.filter(
      (item) => item !== '{{CURRENT_WORKSPACE_MEMBER}}',
    );
  } catch {
    const jsonRelationFilterValueParseResult =
      jsonRelationFilterValueSchema.parse(recordFilterUsedInDropdown?.value);

    isCurrentWorkspaceMemberSelected =
      jsonRelationFilterValueParseResult.isCurrentWorkspaceMemberSelected ??
      false;
    selectedRecordIds = jsonRelationFilterValueParseResult.selectedRecordIds;
  }

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

    const isItemCurrentWorkspaceMemberId =
      itemToSelect.id === currentWorkspaceMemberId;

    const isCurrentWorkspaceMemberIdSelected = true;

    const selectedRecordIdsWithAddedRecord = [
      ...selectedRecordIds,
      itemToSelect.id,
    ];

    const selectedRecordIdsWithRemovedRecord = selectedRecordIds.filter(
      (id) => id !== itemToSelect.id,
    );

    const selectedRecordIdsWithRemovedCurrentWorkspaceMemberId =
      selectedRecordIds.filter((id) => id !== currentWorkspaceMemberId);

    const newSelectedRecordIds = isItemCurrentWorkspaceMember
      ? isCurrentWorkspaceMemberIdSelected
        ? selectedRecordIdsWithRemovedCurrentWorkspaceMemberId
        : selectedRecordIds
      : isNewSelectedValue
        ? selectedRecordIdsWithAddedRecord
        : selectedRecordIdsWithRemovedRecord;

    const newIsCurrentWorkspaceMemberSelected = isItemCurrentWorkspaceMember
      ? isNewSelectedValue
      : isItemCurrentWorkspaceMemberId
        ? false
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
          ? JSON.stringify(
              [
                ...newSelectedRecordIds,
                newIsCurrentWorkspaceMemberSelected
                  ? '{{CURRENT_WORKSPACE_MEMBER}}'
                  : undefined,
              ].filter(isDefined),
            )
          : '';

      const duplicateFilterInCurrentRecordFilters =
        findDuplicateRecordFilterInNonAdvancedRecordFilters({
          recordFilters: currentRecordFilters,
          fieldMetadataItemId: fieldMetadataItemUsedInFilterDropdown.id,
        });

      const filterIsAlreadyInCurrentRecordFilters = isDefined(
        duplicateFilterInCurrentRecordFilters,
      );

      if (filterIsAlreadyInCurrentRecordFilters && !isDefined(recordFilterId)) {
        applyRecordFilter({
          id: duplicateFilterInCurrentRecordFilters.id,
          type: getFilterTypeFromFieldType(
            fieldMetadataItemUsedInFilterDropdown.type,
          ),
          label: fieldMetadataItemUsedInFilterDropdown.label,
          operand: selectedOperandInDropdown,
          displayValue: filterDisplayValue,
          fieldMetadataId: fieldMetadataItemUsedInFilterDropdown.id,
          value: newFilterValue,
          recordFilterGroupId:
            duplicateFilterInCurrentRecordFilters.recordFilterGroupId,
          positionInRecordFilterGroup:
            duplicateFilterInCurrentRecordFilters.positionInRecordFilterGroup,
          subFieldName: duplicateFilterInCurrentRecordFilters.subFieldName,
        });
      } else {
        applyRecordFilter({
          id: selectedFilter?.id ? selectedFilter.id : v4(),
          type: getFilterTypeFromFieldType(
            fieldMetadataItemUsedInFilterDropdown.type,
          ),
          label: fieldMetadataItemUsedInFilterDropdown.label,
          operand: selectedOperandInDropdown,
          displayValue: filterDisplayValue,
          fieldMetadataId: fieldMetadataItemUsedInFilterDropdown.id,
          value: newFilterValue,
          recordFilterGroupId: selectedFilter?.recordFilterGroupId,
          positionInRecordFilterGroup:
            selectedFilter?.positionInRecordFilterGroup,
          subFieldName: selectedFilter?.subFieldName,
        });
      }
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
        hotkeyScope={SingleRecordPickerHotkeyScope.SingleRecordPicker}
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
