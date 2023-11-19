import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const useFilteredSearchCompanyQuery = ({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) => {
  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNameSingular: 'company',
  });

  const useFindManyCompanies = (options: any) =>
    useQuery(findManyQuery, options);

  return useFilteredSearchEntityQueryV2({
    queryHook: useFindManyCompanies,
    filters: [
      {
        fieldNames: ['name.firstName', 'name.lastName'],
        filter: searchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (company) => ({
      entityType: Entity.Company,
      id: company.id,
      name: company.name,
      avatarType: 'squared',
      avatarUrl: '',
      originalEntity: company,
    }),
    selectedIds: selectedIds,
    objectNamePlural: 'workspaceMembers',
    limit,
  });
};
