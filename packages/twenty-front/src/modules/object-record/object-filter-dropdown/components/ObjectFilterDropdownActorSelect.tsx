import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { t } from '@lingui/core/macro';
import {
  arrayOfUuidOrVariableSchema,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/display';

export const EMPTY_ACTOR_FILTER_VALUE: string = JSON.stringify({
  isCurrentWorkspaceMemberSelected: false,
  selectedRecordIds: [],
} satisfies RelationFilterValue);

export const MAX_WORKSPACE_MEMBERS_TO_DISPLAY = 3;

type ObjectFilterDropdownActorSelectProps = {
  dropdownId: string;
};

export const ObjectFilterDropdownActorSelect = ({
  dropdownId,
}: ObjectFilterDropdownActorSelectProps) => {
  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
    jsonRelationFilterValueSchema
      .catch({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
          objectFilterDropdownFilterValue,
        ),
      })
      .parse(objectFilterDropdownFilterValue);

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: selectedRecordIds,
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      limit: 10,
      allowRequestsToTwentyIcons: false,
    });

  const currentWorkspaceMemberSelectableItem: SelectableItem = {
    id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
    name: 'Me',
    isSelected: isCurrentWorkspaceMemberSelected ?? false,
    AvatarIcon: IconUserCircle,
  };

  const pinnedSelectableItems: SelectableItem[] = [
    currentWorkspaceMemberSelectableItem,
  ];

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

    const numberOfSelectedItems = selectedItemNames.length;

    const filterDisplayValue =
      numberOfSelectedItems > MAX_WORKSPACE_MEMBERS_TO_DISPLAY
        ? t`${numberOfSelectedItems} workspace members`
        : selectedItemNames.join(', ');

    const newFilterValue =
      newSelectedRecordIds.length > 0 || newIsCurrentWorkspaceMemberSelected
        ? JSON.stringify({
            isCurrentWorkspaceMemberSelected:
              newIsCurrentWorkspaceMemberSelected,
            selectedRecordIds: newSelectedRecordIds,
          } satisfies RelationFilterValue)
        : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);
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
        selectableListId="object-filter-actor-select-id"
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
