import { useRef } from 'react';
import { useTheme } from '@emotion/react';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuButton } from '@/ui/dropdown/components/DropdownMenuButton';
import { DropdownMenuItemContainer } from '@/ui/dropdown/components/DropdownMenuItemContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { IconPlus } from '@/ui/icon';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';
import { EntityForSelect } from '../types/EntityForSelect';

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
  disableBackgroundBlur = false,
}: {
  onCancel?: () => void;
  onCreate?: () => void;
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect) => void;
  disableBackgroundBlur?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  useListenClickOutsideArrayOfRef([containerRef], () => {
    onCancel?.();
  });

  return (
    <DropdownMenu disableBlur={disableBackgroundBlur} ref={containerRef}>
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
