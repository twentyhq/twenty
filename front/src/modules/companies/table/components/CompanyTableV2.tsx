import { useCallback, useMemo, useState } from 'react';

import { companyViewFields } from '@/companies/constants/companyFieldMetadataArray';
import { CompaniesSelectedSortType, defaultOrderBy } from '@/companies/queries';
import { GenericEntityTableData } from '@/people/components/GenericEntityTableData';
import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/table/components/EntityTableV2';
import { TableContext } from '@/ui/table/states/TableContext';
import {
  CompanyOrderByWithRelationInput,
  useGetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

export function CompanyTable() {
  const [orderBy, setOrderBy] =
    useState<CompanyOrderByWithRelationInput[]>(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<CompaniesSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const filters = useRecoilScopedValue(filtersScopedState, TableContext);

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        orderBy={orderBy}
        whereFilters={whereFilters}
        fieldMetadataArray={companyViewFields}
        filterDefinitionArray={companiesFilters}
      />
      <EntityTable
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={updateSorts}
        useUpdateEntityMutation={useUpdateOneCompanyMutation}
      />
    </>
  );
}
