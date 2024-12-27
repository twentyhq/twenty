import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui';

import { StyledMultipleSelectDropdownAvatarChip } from '@/object-record/select/components/StyledMultipleSelectDropdownAvatarChip';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const MultipleSelectDropdown = ({
  selectableListId,
  hotkeyScope,
  itemsToSelect,
  loadingItems,
  filteredSelectedItems,
  onChange,
  searchFilter,
}: {
  selectableListId: string;
  hotkeyScope: string;
  itemsToSelect: SelectableItem[];
  filteredSelectedItems: SelectableItem[];
  selectedItems: SelectableItem[];
  searchFilter: string;
  onChange: (
    changedItemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => void;
  loadingItems: boolean;
}) => {
  const { closeDropdown } = useDropdown();
  const { selectedItemIdState } = useSelectableListStates({
    selectableListScopeId: selectableListId,
  });

  const { resetSelectedItem } = useSelectableList(selectableListId);

  const selectedItemId = useRecoilValue(selectedItemIdState);

  const handleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    onChange(
      {
        ...itemToSelect,
        isSelected: newSelectedValue,
      },
      newSelectedValue,
    );
  };

  const [itemsInDropdown, setItemInDropdown] = useState([
    ...(filteredSelectedItems ?? []),
    ...(itemsToSelect ?? []),
  ]);

  useEffect(() => {
    if (!loadingItems) {
      setItemInDropdown([
        ...(filteredSelectedItems ?? []),
        ...(itemsToSelect ?? []),
      ]);
    }
  }, [itemsToSelect, filteredSelectedItems, loadingItems]);

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
      resetSelectedItem();
    },
    hotkeyScope,
    [closeDropdown, resetSelectedItem],
  );

  const showNoResult =
    itemsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedItems?.length === 0 &&
    !loadingItems;

  const selectableItemIds = itemsInDropdown.map((item) => item.id);

  return (
    <SelectableList
      selectableListId={selectableListId}
      selectableItemIdArray={selectableItemIds}
      hotkeyScope={hotkeyScope}
      onEnter={(itemId) => {
        const item = itemsInDropdown.findIndex(
          (entity) => entity.id === itemId,
        );
        const itemIsSelectedInDropwdown = filteredSelectedItems.find(
          (entity) => entity.id === itemId,
        );
        handleItemSelectChange(
          itemsInDropdown[item],
          !itemIsSelectedInDropwdown,
        );
        resetSelectedItem();
      }}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {itemsInDropdown?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={item.isSelected}
              isKeySelected={item.id === selectedItemId}
              onSelectChange={(newCheckedValue) => {
                resetSelectedItem();
                handleItemSelectChange(item, newCheckedValue);
              }}
              avatar={
                <StyledMultipleSelectDropdownAvatarChip
                  className="avatar-icon-container"
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  LeftIcon={item.AvatarIcon}
                  avatarType={item.avatarType}
                  isIconInverted={item.isIconInverted}
                  placeholderColorSeed={item.id}
                />
              }
            />
          );
        })}
        {showNoResult && <MenuItem text="No result" />}
        {loadingItems && <DropdownMenuSkeletonItem />}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
