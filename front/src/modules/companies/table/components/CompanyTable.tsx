import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { companyViewFields } from '@/companies/constants/companyViewFields';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsOrderByScopedState } from '@/ui/filter-n-sort/states/sortScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { TableContext } from '@/ui/table/states/TableContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useViewSorts } from '@/views/hooks/useViewSorts';
import { currentViewIdState } from '@/views/states/currentViewIdState';
import {
  useGetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

import { defaultOrderBy } from '../../queries';

export function CompanyTable() {
  const currentViewId = useRecoilValue(currentViewIdState);
  const orderBy = useRecoilScopedValue(sortsOrderByScopedState, TableContext);
  const { updateSorts } = useViewSorts({
    availableSorts,
    Context: TableContext,
  });

  const filters = useRecoilScopedValue(filtersScopedState, TableContext);

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  return (
    <>
      <GenericEntityTableData
        objectName="company"
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        orderBy={orderBy.length ? orderBy : defaultOrderBy}
        whereFilters={whereFilters}
        viewFieldDefinitions={companyViewFields}
        filterDefinitionArray={companiesFilters}
      />
      <EntityTable
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={currentViewId ? updateSorts : undefined}
        useUpdateEntityMutation={useUpdateOneCompanyMutation}
      />
    </>
  );
}
