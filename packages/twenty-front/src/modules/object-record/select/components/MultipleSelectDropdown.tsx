import { Key } from 'ts-key-enum';

import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Avatar } from 'twenty-ui/display';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

export const MultipleSelectDropdown = ({
  selectableListId,
  focusId,
  itemsToSelect,
  loadingItems,
  filteredSelectedItems,
  onChange,
  searchFilter,
}: {
  selectableListId: string;
  focusId: string;
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

  const { resetSelectedItem } = useSelectableList(selectableListId);

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    selectableListId,
  );

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

  const itemsInDropdown = [
    ...(filteredSelectedItems ?? []),
    ...(itemsToSelect ?? []),
  ];

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      closeDropdown();
      resetSelectedItem();
    },
    focusId,
    scope: DropdownHotkeyScope.Dropdown,
    dependencies: [closeDropdown, resetSelectedItem],
  });

  const showNoResult =
    itemsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedItems?.length === 0 &&
    !loadingItems;

  const selectableItemIds = itemsInDropdown.map((item) => item.id);

  return (
    <SelectableList
      selectableListInstanceId={selectableListId}
      selectableItemIdArray={selectableItemIds}
      focusId={focusId}
      hotkeyScope={DropdownHotkeyScope.Dropdown}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {itemsInDropdown?.map((item) => {
          return (
            <SelectableListItem
              itemId={item.id}
              onEnter={() => {
                resetSelectedItem();
                handleItemSelectChange(item, !item.isSelected);
              }}
            >
              <MenuItemMultiSelectAvatar
                key={item.id}
                selected={item.isSelected}
                isKeySelected={item.id === selectedItemId}
                onSelectChange={(newCheckedValue) => {
                  resetSelectedItem();
                  handleItemSelectChange(item, newCheckedValue);
                }}
                text={item.name}
                avatar={
                  <Avatar
                    avatarUrl={item.avatarUrl}
                    placeholderColorSeed={item.id}
                    placeholder={item.name}
                    size="md"
                    type={item.avatarType}
                  />
                }
              />
            </SelectableListItem>
          );
        })}
        {showNoResult && <MenuItem text="No results" />}
        {loadingItems && <DropdownMenuSkeletonItem />}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
