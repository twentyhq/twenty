import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSearchCompanyQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const useFilteredSearchCompanyQuery = ({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) => {
  return useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    filters: [
      {
        fieldNames: ['name'],
        filter: searchFilter,
      },
    ],
    orderByField: 'name',
    mappingFunction: (company) => ({
      id: company.id,
      entityType: ActivityTargetableEntityType.Company,
      name: company.name,
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
      domainName: company.domainName,
      avatarType: 'squared',
    }),
    selectedIds: selectedIds,
    limit,
  });
};
