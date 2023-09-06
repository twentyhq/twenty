import { companiesAvailableColumnDefinitions } from '@/companies/constants/companiesAvailableColumnDefinitions';
import { getCompaniesOptimisticEffect } from '@/companies/graphql/optimistic-effects/getCompaniesOptimisticEffect';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersWhereScopedSelector } from '@/ui/view-bar/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/view-bar/states/selectors/sortsOrderByScopedSelector';
import { useTableViews } from '@/views/hooks/useTableViews';
import {
  SortOrder,
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

export function CompanyTable() {
  const sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const filtersWhere = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const { handleViewsChange, handleViewSubmit } = useTableViews({
    availableFilters: companiesFilters,
    availableSorts,
    objectId: 'company',
    columnDefinitions: companiesAvailableColumnDefinitions,
  });

  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  const { setActionBarEntries } = useCompanyTableActionBarEntries();

  function handleImport() {
    openCompanySpreadsheetImport();
  }

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        getRequestOptimisticEffect={getCompaniesOptimisticEffect}
        orderBy={
          sortsOrderBy.length ? sortsOrderBy : [{ createdAt: SortOrder.Desc }]
        }
        whereFilters={filtersWhere}
        filterDefinitionArray={companiesFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <EntityTable
        viewName="All Companies"
        availableSorts={availableSorts}
        onViewsChange={handleViewsChange}
        onViewSubmit={handleViewSubmit}
        onImport={handleImport}
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
