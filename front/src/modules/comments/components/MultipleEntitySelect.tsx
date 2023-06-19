import { debounce } from 'lodash';

import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/components/menu/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { Avatar, AvatarType } from '@/users/components/Avatar';
import { CommentableType } from '~/generated/graphql';

export type EntitiesForMultipleEntitySelect = {
  selectedEntities: EntityForSelect[];
  filteredSelectedEntities: EntityForSelect[];
  entitiesToSelect: EntityForSelect[];
};

export type EntityTypeForSelect = CommentableType; // TODO: derivate from all usable entity types

export type EntityForSelect = {
  id: string;
  entityType: EntityTypeForSelect;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
};

export function MultipleEntitySelect({
  entities,
  onItemCheckChange,
  onSearchFilterChange,
  searchFilter,
}: {
  entities: EntitiesForMultipleEntitySelect;
  searchFilter: string;
  onSearchFilterChange: (newSearchFilter: string) => void;
  onItemCheckChange: (
    newCheckedValue: boolean,
    entity: EntityForSelect,
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
