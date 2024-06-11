import { useRecoilValue } from 'recoil';

import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';

export const useRelationPickerEntitiesOptions = ({
  relationObjectNameSingular,
  relationPickerScopeId = 'relation-picker',
  selectedRelationRecordIds = [],
  excludedRelationRecordIds = [],
}: {
  relationObjectNameSingular: string;
  relationPickerScopeId?: string;
  selectedRelationRecordIds?: string[];
  excludedRelationRecordIds?: string[];
}) => {
  const { searchQueryState, relationPickerSearchFilterState } =
    useRelationPickerScopedStates({
      relationPickerScopedId: relationPickerScopeId,
    });
  const relationPickerSearchFilter = useRecoilValue(
    relationPickerSearchFilterState,
  );

  const searchQuery = useRecoilValue(searchQueryState);
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

  return { entities, relationPickerSearchFilter };
};
