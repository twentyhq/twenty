import { useRef } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';

import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Avatar } from '@/users/components/Avatar';

export type EntitiesForMultipleObjectRecordSelect = {
  selectedObjectRecords: ObjectRecordForSelect[];
  filteredSelectedObjectRecords: ObjectRecordForSelect[];
  objectRecordsToSelect: ObjectRecordForSelect[];
  loading: boolean;
};

export const MultipleObjectRecordSelect = ({
  multipleObjectRecords,
  onChange,
  onSubmit,
  onSearchFilterChange,
  searchFilter,
  value,
}: {
  multipleObjectRecords: EntitiesForMultipleObjectRecordSelect;
  searchFilter: string;
  onSearchFilterChange: (newSearchFilter: string) => void;
  onChange: (value: Record<string, boolean>) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  value: Record<string, boolean>;
}) => {
  const debouncedSetSearchFilter = debounce(onSearchFilterChange, 100, {
    leading: true,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchFilter(event.currentTarget.value);
    onSearchFilterChange(event.currentTarget.value);
  };

  let entitiesInDropdown = [
    ...(multipleObjectRecords.filteredSelectedObjectRecords ?? []),
    ...(multipleObjectRecords.objectRecordsToSelect ?? []),
  ];

  entitiesInDropdown = entitiesInDropdown.filter((entity) =>
    isNonEmptyString(entity.recordIdentifier.id),
  );

  console.log({
    entitiesInDropdown,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onSubmit?.();
    },
  });

  const selectableItemIds = entitiesInDropdown.map(
    (entity) => entity.recordIdentifier.id,
  );

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListId="multiple-entity-select-list"
          selectableItemIdArray={selectableItemIds}
          hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
          onEnter={(_itemId) => {
            if (_itemId in value === false || value[_itemId] === false) {
              onChange({ ...value, [_itemId]: true });
            } else {
              onChange({ ...value, [_itemId]: false });
            }
          }}
        >
          {entitiesInDropdown?.map((entity) => (
            <SelectableItem itemId={entity.record.id} key={entity.record.id}>
              <MenuItemMultiSelectAvatar
                key={entity.record.id}
                selected={value[entity.record.id]}
                onSelectChange={(newCheckedValue) =>
                  onChange({ ...value, [entity.record.id]: newCheckedValue })
                }
                avatar={
                  <Avatar
                    avatarUrl={entity.recordIdentifier.avatarUrl}
                    colorId={entity.record.id}
                    placeholder={entity.recordIdentifier.name}
                    size="md"
                    type={entity.recordIdentifier.avatarType ?? 'rounded'}
                  />
                }
                text={entity.recordIdentifier.name}
              />
            </SelectableItem>
          ))}
        </SelectableList>
        {entitiesInDropdown?.length === 0 && <MenuItem text="No result" />}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
