import { FilterDropdownEntitySearchSelect } from '@/lib/filters-and-sorts/components/FilterDropdownEntitySearchSelect';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSelectedEntityIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { TableContext } from '@/ui/tables/states/TableContext';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { useSearchCompanyQuery } from '~/generated/graphql';

export function FilterDropdownCompanySearchSelect() {
  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  const [filterDropdownSelectedEntityId] = useRecoilScopedState(
    filterDropdownSelectedEntityIdScopedState,
    TableContext,
  );

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
    mappingFunction: (company) => ({
      id: company.id,
      entityType: Entity.User,
      name: `${company.name}`,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    searchFilter: filterDropdownSearchInput,
  });

  return (
    <FilterDropdownEntitySearchSelect
      entitiesForSelect={usersForSelect}
      context={TableContext}
    />
  );
}
