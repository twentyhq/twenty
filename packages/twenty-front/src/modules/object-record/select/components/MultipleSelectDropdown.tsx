import { ListItem } from 'twenty-ui/primitives/navigation';
import { Key } from 'ts-key-enum';

import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MultipleSelectDropdownItem } from '@/object-record/select/components/MultipleSelectDropdownItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';

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
  const { closeDropdown } = useCloseDropdown();

  const { resetSelectedItem } = useSelectableList(selectableListId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListId,
  );

  const handleItemSelectChange = (itemToSelect: SelectableItem) => {
    const newSelectedValue = !itemToSelect.isSelected;
    resetSelectedItem();
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
    >
      <DropdownMenuItemsContainer isMultiSelect hasMaxHeight>
        {itemsInDropdown.map((item) => (
          <MultipleSelectDropdownItem
            key={item.id}
            item={item}
            focused={item.id === selectedItemId}
            onSelect={handleItemSelectChange}
          />
        ))}
        {showNoResult && <ListItem disabled>{t`No results`}</ListItem>}
        {loadingItems && <DropdownMenuSkeletonItem />}
      </DropdownMenuItemsContainer>
    </SelectableList>
  );
};
