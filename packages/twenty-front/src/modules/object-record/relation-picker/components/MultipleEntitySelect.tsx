import { useRef } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';

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

import { EntityForSelect } from '../types/EntityForSelect';

export type EntitiesForMultipleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
  selectedEntities: CustomEntityForSelect[];
  filteredSelectedEntities: CustomEntityForSelect[];
  entitiesToSelect: CustomEntityForSelect[];
  loading: boolean;
};

export const MultipleEntitySelect = <
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onChange,
  onSubmit,
  onSearchFilterChange,
  searchFilter,
  value,
}: {
  entities: EntitiesForMultipleEntitySelect<CustomEntityForSelect>;
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
    ...(entities.filteredSelectedEntities ?? []),
    ...(entities.entitiesToSelect ?? []),
  ];

  entitiesInDropdown = entitiesInDropdown.filter((entity) =>
    isNonEmptyString(entity.name),
  );

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

  const selectableItemIds = entitiesInDropdown.map((entity) => entity.id);

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
            <SelectableItem itemId={entity.id} key={entity.id}>
              <MenuItemMultiSelectAvatar
                key={entity.id}
                selected={value[entity.id]}
                onSelectChange={(newCheckedValue) =>
                  onChange({ ...value, [entity.id]: newCheckedValue })
                }
                avatar={
                  <Avatar
                    avatarUrl={entity.avatarUrl}
                    colorId={entity.id}
                    placeholder={entity.name}
                    size="md"
                    type={entity.avatarType ?? 'rounded'}
                  />
                }
                text={entity.name}
              />
            </SelectableItem>
          ))}
        </SelectableList>
        {entitiesInDropdown?.length === 0 && <MenuItem text="No result" />}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
