import { useRecoilValue } from 'recoil';

import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const useRelationPickerEntitiesOptions = ({
  relationObjectNameSingular,
  selectedRelationRecordIds = [],
  excludedRelationRecordIds = [],
}: {
  relationObjectNameSingular: string;
  selectedRelationRecordIds?: string[];
  excludedRelationRecordIds?: string[];
}) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );

  const { searchQueryState, relationPickerSearchFilterState } =
    useRelationPickerScopedStates({
      relationPickerScopedId: scopeId,
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
    excludeRecordIds: excludedRelationRecordIds,
    objectNameSingular: relationObjectNameSingular,
  });

  return { entities, relationPickerSearchFilter };
};
