import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { Avatar } from 'twenty-ui';

import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const MultipleRecordSelectDropdown = ({
  selectableListId,
  hotkeyScope,
  recordsToSelect,
  loadingRecords,
  filteredSelectedRecords,
  onChange,
  searchFilter,
}: {
  selectableListId: string;
  hotkeyScope: string;
  recordsToSelect: SelectableRecord[];
  filteredSelectedRecords: SelectableRecord[];
  selectedRecords: SelectableRecord[];
  searchFilter: string;
  onChange: (
    changedRecordToSelect: SelectableRecord,
    newSelectedValue: boolean,
  ) => void;
  loadingRecords: boolean;
}) => {
  const { closeDropdown } = useDropdown();
  const { selectedItemIdState } = useSelectableListStates({
    selectableListScopeId: selectableListId,
  });

  const { handleResetSelectedPosition } = useSelectableList(selectableListId);

  const selectedItemId = useRecoilValue(selectedItemIdState);

  const handleRecordSelectChange = (
    recordToSelect: SelectableRecord,
    newSelectedValue: boolean,
  ) => {
    onChange(
      {
        ...recordToSelect,
        isSelected: newSelectedValue,
      },
      newSelectedValue,
    );
  };

  const [recordsInDropdown, setRecordInDropdown] = useState([
    ...(filteredSelectedRecords ?? []),
    ...(recordsToSelect ?? []),
  ]);

  useEffect(() => {
    if (!loadingRecords) {
      setRecordInDropdown([
        ...(filteredSelectedRecords ?? []),
        ...(recordsToSelect ?? []),
      ]);
    }
  }, [recordsToSelect, filteredSelectedRecords, loadingRecords]);

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
      handleResetSelectedPosition();
    },
    hotkeyScope,
    [closeDropdown, handleResetSelectedPosition],
  );

  const showNoResult =
    recordsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedRecords?.length === 0 &&
    !loadingRecords;

  const selectableItemIds = recordsInDropdown.map((record) => record.id);

  return (
    <SelectableList
      selectableListId={selectableListId}
      selectableItemIdArray={selectableItemIds}
      hotkeyScope={hotkeyScope}
      onEnter={(itemId) => {
        const record = recordsInDropdown.findIndex(
          (entity) => entity.id === itemId,
        );
        const recordIsSelectedInDropwdown = filteredSelectedRecords.find(
          (entity) => entity.id === itemId,
        );
        handleRecordSelectChange(
          recordsInDropdown[record],
          !recordIsSelectedInDropwdown,
        );
        handleResetSelectedPosition();
      }}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {recordsInDropdown?.map((record) => {
          return (
            <MenuItemMultiSelectAvatar
              key={record.id}
              selected={record.isSelected}
              isKeySelected={record.id === selectedItemId}
              onSelectChange={(newCheckedValue) => {
                handleResetSelectedPosition();
                handleRecordSelectChange(record, newCheckedValue);
              }}
              avatar={
                <Avatar
                  avatarUrl={record.avatarUrl}
                  placeholderColorSeed={record.id}
                  placeholder={record.name}
                  size="md"
                  type={record.avatarType ?? 'rounded'}
                />
              }
              text={record.name}
            />
          );
        })}
        {showNoResult && <MenuItem text="No result" />}
        {loadingRecords && <DropdownMenuSkeletonItem />}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
