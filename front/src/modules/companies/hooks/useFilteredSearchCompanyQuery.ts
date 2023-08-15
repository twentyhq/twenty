import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ActivityTargetableEntityForSelect } from '@/activities/types/ActivityTargetableEntityForSelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSearchCompanyQuery } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export function useFilteredSearchCompanyQuery({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) {
  return useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: selectedIds,
    mappingFunction: (company) =>
      ({
        id: company.id,
        entityType: ActivityTargetableEntityType.Company,
        name: company.name,
        avatarUrl: getLogoUrlFromDomainName(company.domainName),
        avatarType: 'squared',
      } as ActivityTargetableEntityForSelect),
    searchFilter,
    limit,
  });
}
