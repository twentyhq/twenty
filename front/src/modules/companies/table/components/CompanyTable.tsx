import { useCallback } from 'react';

import { companyViewFields } from '@/companies/constants/companyViewFields';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { filtersWhereScopedSelector } from '@/ui/filter-n-sort/states/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/filter-n-sort/states/sortsOrderByScopedSelector';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useTableViews } from '@/views/hooks/useTableViews';
import { useViewFilters } from '@/views/hooks/useViewFilters';
import { useViewSorts } from '@/views/hooks/useViewSorts';
import {
  SortOrder,
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

export function CompanyTable() {
  const orderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const whereFilters = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const objectId = 'company';
  const { handleViewsChange } = useTableViews({
    availableFilters: companiesFilters,
    availableSorts,
    objectId,
  });
  const { handleColumnsChange } = useTableViewFields({
    objectName: objectId,
    viewFieldDefinitions: companyViewFields,
  });

  const { persistFilters } = useViewFilters({
    availableFilters: companiesFilters,
  });
  const { persistSorts } = useViewSorts({ availableSorts });
  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  const { setActionBarEntries } = useCompanyTableActionBarEntries();

  const handleViewSubmit = useCallback(async () => {
    await persistFilters();
    await persistSorts();
  }, [persistFilters, persistSorts]);

  function handleImport() {
    openCompanySpreadsheetImport();
  }

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        orderBy={orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }]}
        whereFilters={whereFilters}
        filterDefinitionArray={companiesFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <EntityTable
        viewName="All Companies"
        availableSorts={availableSorts}
        onColumnsChange={handleColumnsChange}
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
