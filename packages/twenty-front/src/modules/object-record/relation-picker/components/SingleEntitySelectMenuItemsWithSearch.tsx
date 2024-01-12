import { useContext } from 'react';

import { BoardCardIdContext } from '@/object-record/record-board/contexts/BoardCardIdContext';
import {
  SingleEntitySelectMenuItems,
  SingleEntitySelectMenuItemsProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItems';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';

export type SingleEntitySelectMenuItemsWithSearchProps = {
  onCreate?: () => void;
} & Pick<
  SingleEntitySelectMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'entitiesToSelect'
  | 'loading'
  | 'onCancel'
  | 'onEntitySelected'
  | 'selectedEntity'
>;

export const SingleEntitySelectMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  entitiesToSelect,
  loading,
  onCancel,
  onCreate,
  onEntitySelected,
  selectedEntity,
}: SingleEntitySelectMenuItemsWithSearchProps) => {
  const { searchFilter, handleSearchFilterChange } = useEntitySelectSearch();

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  const boardCardId = useContext(BoardCardIdContext);
  const weAreInOpportunitiesPageCard = isDefined(boardCardId);
  const hideSearchInput =
    weAreInOpportunitiesPageCard && !entitiesToSelect.length && !selectedEntity;

  return (
    <>
      {!hideSearchInput && (
        <DropdownMenuSearchInput
          value={searchFilter}
          onChange={handleSearchFilterChange}
          autoFocus
        />
      )}
      <DropdownMenuSeparator />
      <SingleEntitySelectMenuItems
        {...{
          EmptyIcon,
          emptyLabel,
          entitiesToSelect,
          loading,
          onCancel,
          onCreate,
          onEntitySelected,
          selectedEntity,
          showCreateButton,
        }}
      />
    </>
  );
};
