import { useRef } from 'react';
import { useTheme } from '@emotion/react';

import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { IconPlus } from '@/ui/icon';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';
import { EntityForSelect } from '../types/EntityForSelect';

import {
  EntitiesForSingleEntitySelect,
  SingleEntitySelectBase,
} from './SingleEntitySelectBase';

export function SingleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onEntitySelected,
  onCreate,
  onCancel,
  width,
  disableBackgroundBlur = false,
  noUser,
}: {
  onCancel?: () => void;
  onCreate?: () => void;
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect | null | undefined) => void;
  disableBackgroundBlur?: boolean;
  width?: number;
  noUser?: CustomEntityForSelect;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onCancel?.();
    },
  });
  return (
    <StyledDropdownMenu
      disableBlur={disableBackgroundBlur}
      ref={containerRef}
      width={width}
    >
      <DropdownMenuInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        autoFocus
      />
      <StyledDropdownMenuSeparator />
      <SingleEntitySelectBase
        entities={entities}
        onEntitySelected={onEntitySelected}
        onCancel={onCancel}
        noUser={noUser}
      />
      {showCreateButton && (
        <>
          <StyledDropdownMenuItemsContainer hasMaxHeight>
            <DropdownMenuItem onClick={onCreate}>
              <IconPlus size={theme.icon.size.md} />
              Add New
            </DropdownMenuItem>
          </StyledDropdownMenuItemsContainer>
          <StyledDropdownMenuSeparator />
        </>
      )}
    </StyledDropdownMenu>
  );
}
