import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import {
  SingleEntitySelectMenuItems,
  SingleEntitySelectMenuItemsProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItems';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
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
}: SingleEntitySelectMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useEntitySelectSearch({
    relationPickerScopeId,
  });

  const { searchQueryState, relationPickerSearchFilterState } =
    useRelationPickerScopedStates({
      relationPickerScopedId: relationPickerScopeId,
    });

  const searchQuery = useRecoilValue(searchQueryState);
  const relationPickerSearchFilter = useRecoilValue(
    relationPickerSearchFilterState,
  );

  const showCreateButton =
    isDefined(onCreate) && relationPickerSearchFilter !== '';

  const entities = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(relationObjectNameSingular) ?? [],
        filter: relationPickerSearchFilter,
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
      <DropdownMenuSearchInput onChange={handleSearchFilterChange} autoFocus />
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
