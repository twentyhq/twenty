import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const useFilteredSearchPeopleQuery = ({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) => {
  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNameSingular: 'person',
  });

  const useFindManyPeople = (options: any) => useQuery(findManyQuery, options);

  return useFilteredSearchEntityQueryV2({
    queryHook: useFindManyPeople,
    filters: [
      {
        fieldNames: ['name.firstName', 'name.lastName'],
        filter: searchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (person) => ({
      entityType: Entity.Person,
      id: person.id,
      name: person.name.firstName + ' ' + person.name.lastName,
      avatarType: 'rounded',
      avatarUrl: '',
      originalEntity: person,
    }),
    selectedIds: selectedIds,
    objectNamePlural: 'workspaceMembers',
    limit,
  });
};
