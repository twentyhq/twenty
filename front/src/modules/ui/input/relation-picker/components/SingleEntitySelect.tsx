import { useRef } from 'react';

import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';
import { EntityForSelect } from '../types/EntityForSelect';

import {
  SingleEntitySelectBase,
  type SingleEntitySelectBaseProps,
} from './SingleEntitySelectBase';

export type SingleEntitySelectProps<
  CustomEntityForSelect extends EntityForSelect,
> = {
  disableBackgroundBlur?: boolean;
  onCreate?: () => void;
  width?: number;
} & Pick<
  SingleEntitySelectBaseProps<CustomEntityForSelect>,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'entitiesToSelect'
  | 'loading'
  | 'onCancel'
  | 'onEntitySelected'
  | 'selectedEntity'
>;

export const SingleEntitySelect = <
  CustomEntityForSelect extends EntityForSelect,
>({
  disableBackgroundBlur = false,
  onCancel,
  onCreate,
  width,
  ...props
}: SingleEntitySelectProps<CustomEntityForSelect>) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        autoFocus
      />
      <StyledDropdownMenuSeparator />
      <SingleEntitySelectBase
        {...props}
        onCancel={onCancel}
        onCreate={onCreate}
        showCreateButton={showCreateButton}
      />
    </StyledDropdownMenu>
  );
};
