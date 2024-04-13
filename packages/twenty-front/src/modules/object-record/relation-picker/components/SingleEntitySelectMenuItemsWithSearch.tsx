import { useEffect } from 'react';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import {
  SingleEntitySelectMenuItems,
  SingleEntitySelectMenuItemsProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItems';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { isDefined } from '~/utils/isDefined';

import { useEntitySelectSearch } from '../hooks/useEntitySelectSearch';

export type SingleEntitySelectMenuItemsWithSearchProps = {
  excludedRelationRecordIds?: string[];
  onCreate?: () => void;
  relationObjectNameSingular: string;
  relationPickerScopeId?: string;
  selectedRelationRecordIds: string[];
  clearOnOpen?: boolean;
} & Pick<
  SingleEntitySelectMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onEntitySelected'
  | 'selectedEntity'
>;

export const SingleEntitySelectMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRelationRecordIds,
  onCancel,
  onCreate,
  onEntitySelected,
  relationObjectNameSingular,
  relationPickerScopeId = 'relation-picker',
  selectedEntity,
  selectedRelationRecordIds,
  clearOnOpen = false,
}: SingleEntitySelectMenuItemsWithSearchProps) => {
  const {
    searchFilter,
    searchQuery,
    handleSearchFilterChange,
    resetSearchFilterChange,
  } = useEntitySelectSearch({
    relationPickerScopeId,
  });

  useEffect(() => {
    if (clearOnOpen) {
      resetSearchFilterChange();
    }
    // We only want to clear the search filter when the dropdown is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCreateButton = isDefined(onCreate) && searchFilter !== '';

  const entities = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(relationObjectNameSingular) ?? [],
        filter: searchFilter,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: selectedRelationRecordIds,
    excludeEntityIds: excludedRelationRecordIds,
    objectNameSingular: relationObjectNameSingular,
  });

  return (
    <>
      <ObjectMetadataItemsRelationPickerEffect
        relationPickerScopeId={relationPickerScopeId}
      />
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <SingleEntitySelectMenuItems
        entitiesToSelect={entities.entitiesToSelect}
        loading={entities.loading}
        selectedEntity={selectedEntity ?? entities.selectedEntities[0]}
        {...{
          EmptyIcon,
          emptyLabel,
          onCancel,
          onCreate,
          onEntitySelected,
          showCreateButton,
        }}
      />
    </>
  );
};
