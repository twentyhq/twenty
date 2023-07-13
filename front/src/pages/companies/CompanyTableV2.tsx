import { useCallback, useMemo, useState } from 'react';
import { IconList } from '@tabler/icons-react';

import {
  CompaniesSelectedSortType,
  defaultOrderBy,
} from '@/companies/services';
import { companyColumns } from '@/companies/table/components/companyColumns';
import { CompanyEntityTableData } from '@/companies/table/components/CompanyEntityTableData';
import { reduceSortsToOrderBy } from '@/filters-and-sorts/helpers';
import { activeTableFiltersScopedState } from '@/filters-and-sorts/states/activeTableFiltersScopedState';
import { turnFilterIntoWhereClause } from '@/filters-and-sorts/utils/turnFilterIntoWhereClause';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/components/table/EntityTableV2';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTableV2';
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

  const filters = useRecoilScopedValue(
    activeTableFiltersScopedState,
    TableContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  return (
    <>
      <CompanyEntityTableData orderBy={orderBy} whereFilters={whereFilters} />
      <HooksEntityTable
        numberOfColumns={companyColumns.length}
        availableTableFilters={companiesFilters}
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
