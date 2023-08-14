import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { companyViewFields } from '@/companies/constants/companyViewFields';
import { useActionBarEntries } from '@/companies/hooks/useActionBarEntries';
import { useContextMenuEntries } from '@/companies/hooks/useContextMenuEntries';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsOrderByScopedState } from '@/ui/filter-n-sort/states/sortScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useViewSorts } from '@/views/hooks/useViewSorts';
import { currentViewIdState } from '@/views/states/currentViewIdState';
import {
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

import { defaultOrderBy } from '../../queries';

export function CompanyTable() {
  const currentViewId = useRecoilValue(currentViewIdState);
  const orderBy = useRecoilScopedValue(
    sortsOrderByScopedState,
    TableRecoilScopeContext,
  );
  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const { handleColumnsChange } = useTableViewFields({
    objectName: 'company',
    viewFieldDefinitions: companyViewFields,
  });
  const { updateSorts } = useViewSorts({
    availableSorts,
    Context: TableRecoilScopeContext,
  });

  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  const setContextMenu = useContextMenuEntries();
  const setActionBar = useActionBarEntries();

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        orderBy={orderBy.length ? orderBy : defaultOrderBy}
        whereFilters={whereFilters}
        filterDefinitionArray={companiesFilters}
        setContextMenu={setContextMenu}
        setActionBar={setActionBar}
      />
      <EntityTable
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onColumnsChange={handleColumnsChange}
        onSortsUpdate={currentViewId ? updateSorts : undefined}
        updateEntityMutation={({
          variables,
        }: {
          variables: UpdateOneCompanyMutationVariables;
        }) =>
          updateEntityMutation({
            variables,
            onCompleted: (data) => {
              if (!data.updateOneCompany) {
                return;
              }
              upsertEntityTableItem(data.updateOneCompany);
            },
          })
        }
      />
    </>
  );
}
