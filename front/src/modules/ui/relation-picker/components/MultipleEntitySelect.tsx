import debounce from 'lodash.debounce';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/dropdown/components/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/dropdown/components/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
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

export function MultipleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onItemCheckChange,
  onSearchFilterChange,
  searchFilter,
}: {
  entities: EntitiesForMultipleEntitySelect<CustomEntityForSelect>;
  searchFilter: string;
  onSearchFilterChange: (newSearchFilter: string) => void;
  onItemCheckChange: (
    newCheckedValue: boolean,
    entity: CustomEntityForSelect,
  ) => void;
}) {
  const debouncedSetSearchFilter = debounce(onSearchFilterChange, 100, {
    leading: true,
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    debouncedSetSearchFilter(event.currentTarget.value);
    onSearchFilterChange(event.currentTarget.value);
  }

  const entitiesInDropdown = [
    ...(entities.filteredSelectedEntities ?? []),
    ...(entities.entitiesToSelect ?? []),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuSearch
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemContainer>
        {entitiesInDropdown?.map((entity) => (
          <DropdownMenuCheckableItem
            key={entity.id}
            checked={
              entities.selectedEntities
                ?.map((selectedEntity) => selectedEntity.id)
                ?.includes(entity.id) ?? false
            }
            onChange={(newCheckedValue) =>
              onItemCheckChange(newCheckedValue, entity)
            }
          >
            <Avatar
              avatarUrl={entity.avatarUrl}
              colorId={entity.id}
              placeholder={entity.name}
              size={16}
              type={entity.avatarType ?? 'rounded'}
            />
            {entity.name}
          </DropdownMenuCheckableItem>
        ))}
        {entitiesInDropdown?.length === 0 && (
          <DropdownMenuItem>No result</DropdownMenuItem>
        )}
      </DropdownMenuItemContainer>
    </DropdownMenu>
  );
}
