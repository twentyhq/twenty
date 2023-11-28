import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';

export const ObjectFilterDropdownEntitySelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilterDropdown();

  const objectMetadataNameSingular =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNameSingular ?? '';

  const objectMetadataNamePlural =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNamePlural ?? '';

  const { findManyQuery } = useObjectMetadataItem({
    objectNameSingular: objectMetadataNameSingular,
  });

  const useFindManyQuery = (options: any) => useQuery(findManyQuery, options);

  const { identifiersMapper, searchQuery } = useRelationPicker();

  const filteredSearchEntityResults = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(objectMetadataNameSingular) ?? [],
        filter: objectFilterDropdownSearchInput,
      },
    ],
    orderByField: 'createdAt',
    selectedIds: objectFilterDropdownSelectedEntityId
      ? [objectFilterDropdownSelectedEntityId]
      : [],
    mappingFunction: (record: any) =>
      identifiersMapper?.(record, objectMetadataNameSingular),
    objectNamePlural: objectMetadataNamePlural,
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
