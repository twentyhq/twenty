import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Skeleton from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import { IconPlus } from '@tabler/icons-react';

import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuButton } from '@/ui/components/menu/DropdownMenuButton';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSelectableItem } from '@/ui/components/menu/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { Avatar } from '@/users/components/Avatar';
import { isDefined } from '@/utils/type-guards/isDefined';

import { useEntitySelectLogic } from '../hooks/useEntitySelectLogic';

import 'react-loading-skeleton/dist/skeleton.css';

export type EntitiesForSingleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const entitiesInDropdown = isDefined(entities.selectedEntity)
    ? [entities.selectedEntity, ...(entities.entitiesToSelect ?? [])]
    : entities.entitiesToSelect ?? [];

  const { hoveredIndex, searchFilter, handleSearchFilterChange } =
    useEntitySelectLogic({
      entities: entitiesInDropdown,
      containerRef,
    });

  useHotkeys(
    'enter',
    () => {
      onEntitySelected(entitiesInDropdown[hoveredIndex]);
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [entitiesInDropdown, hoveredIndex, onEntitySelected],
  );

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
          <DropdownMenuItemContainer>
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
          <DropdownMenuItem>
              <Skeleton count={5} />
          </DropdownMenuItem>
        )}
      </DropdownMenuItemContainer>
    </DropdownMenu>
  );
}
