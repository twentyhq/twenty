import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';

import { useFilter } from '../hooks/useFilter';

export const ObjectFilterDropdownEntitySelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilter();

  const { findManyQuery } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });

  const useFindManyQuery = (options: any) => useQuery(findManyQuery, options);

  const { identifiersMapper, searchQuery } = useRelationPicker();

  const filteredSearchEntityResults = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames: searchQuery?.computeFilterFields?.('company') ?? [],
        filter: objectFilterDropdownSearchInput,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: objectFilterDropdownSelectedEntityId
      ? [objectFilterDropdownSelectedEntityId]
      : [],
    mappingFunction: (record: any) => identifiersMapper?.(record, 'company'),
    objectNamePlural: 'companies',
  });

  if (filterDefinitionUsedInDropdown?.type !== 'RELATION') {
    return null;
  }

  return (
    <>
      <ObjectFilterDropdownEntitySearchSelect
        entitiesForSelect={filteredSearchEntityResults}
      />
    </>
  );
};
