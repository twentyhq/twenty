import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import { IconPlus } from '@tabler/icons-react';

import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { DropdownMenu } from '@/ui/components/menu/DropdownMenu';
import { DropdownMenuButton } from '@/ui/components/menu/DropdownMenuButton';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/components/menu/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/components/menu/DropdownMenuSeparator';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { isDefined } from '@/utils/type-guards/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';

import { SingleEntitySelectBase } from './SingleEntitySelectBase';

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
  onCancel,
}: {
  onCancel?: () => void;
  onCreate?: () => void;
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  useListenClickOutsideArrayOfRef([containerRef], () => {
    onCancel?.();
  });

  return (
    <DropdownMenu ref={containerRef}>
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
      <SingleEntitySelectBase
        entities={entities}
        onEntitySelected={onEntitySelected}
        onCancel={onCancel}
      />
    </DropdownMenu>
  );
}
