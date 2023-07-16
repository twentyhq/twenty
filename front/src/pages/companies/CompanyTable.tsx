import { useCallback, useMemo, useState } from 'react';
import { IconList } from '@tabler/icons-react';

import { CompaniesSelectedSortType, defaultOrderBy } from '@/companies/queries';
import { companyColumns } from '@/companies/table/components/companyColumns';
import { CompanyEntityTableData } from '@/companies/table/components/CompanyEntityTableData';
import { reduceSortsToOrderBy } from '@/lib/filters-and-sorts/helpers';
import { filtersScopedState } from '@/lib/filters-and-sorts/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/lib/filters-and-sorts/utils/turnFilterIntoWhereClause';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { TableContext } from '@/ui/tables/states/TableContext';
import { CompanyOrderByWithRelationInput } from '~/generated/graphql';

import { companiesFilters } from './companies-filters';
import { availableSorts } from './companies-sorts';

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
      <CompanyEntityTableData orderBy={orderBy} whereFilters={whereFilters} />
      <HooksEntityTable
        numberOfColumns={companyColumns.length}
        availableFilters={companiesFilters}
      />
      <EntityTable
        columns={companyColumns}
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={updateSorts}
      />
    </>
  );
}
