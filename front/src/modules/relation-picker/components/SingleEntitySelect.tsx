import { useTheme } from '@emotion/react';
import { IconPlus } from '@tabler/icons-react';

import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuButton } from '@/ui/components/menu/DropdownMenuButton';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { isDefined } from '@/utils/type-guards/isDefined';

import { useEntitySelectLogic } from '../hooks/useEntitySelectLogic';

export type EntitiesForSingleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
  loading: boolean;
  selectedEntity: CustomEntityForSelect;
  entitiesToSelect: CustomEntityForSelect[];
};

export function SingleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onEntitySelected,
  onCreate,
}: {
  onCreate?: () => void;
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect) => void;
}) {
  const theme = useTheme();

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  return (
    <DropdownMenu>
      <DropdownMenuSearch
        value={searchFilter}
        onChange={handleSearchFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      {showCreateButton && (
        <>
          <DropdownMenuItemContainer style={{ maxHeight: 180 }}>
            <DropdownMenuButton onClick={onCreate}>
              <IconPlus size={theme.icon.size.md} />
              Create new
            </DropdownMenuButton>
          </DropdownMenuItemContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemContainer ref={containerRef}>
        {entitiesInDropdown?.map((entity, index) => (
          <DropdownMenuSelectableItem
            key={entity.id}
            selected={entities.selectedEntity?.id === entity.id}
            hovered={hoveredIndex === index}
            onClick={() => onEntitySelected(entity)}
          >
            <Avatar
              avatarUrl={entity.avatarUrl}
              placeholder={entity.name}
              size={16}
              type={entity.avatarType ?? 'rounded'}
            />
            {entity.name}
          </DropdownMenuSelectableItem>
        ))}
        {entitiesInDropdown?.length === 0 && (
          <DropdownMenuItem>No result</DropdownMenuItem>
        )}
      </DropdownMenuItemContainer>
    </DropdownMenu>
  );
}
