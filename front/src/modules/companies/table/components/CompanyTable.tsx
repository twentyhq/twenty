import { companiesAvailableColumnDefinitions } from '@/companies/constants/companiesAvailableColumnDefinitions';
import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { DataTable } from '@/ui/Data/Data Table/components/DataTable';
import { DataTableEffect } from '@/ui/Data/Data Table/components/DataTableEffect';
import { TableContext } from '@/ui/Data/Data Table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/Data/Data Table/hooks/useUpsertDataTableItem';
import { TableRecoilScopeContext } from '@/ui/Data/Data Table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/Data/View Bar/contexts/ViewBarContext';
import { filtersWhereScopedSelector } from '@/ui/Data/View Bar/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/Data/View Bar/states/selectors/sortsOrderByScopedSelector';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViews } from '@/views/hooks/useTableViews';
import {
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useGetWorkspaceMembersLazyQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

export const CompanyTable = () => {
  const sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const filtersWhere = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const {
    createView,
    deleteView,
    persistColumns,
    submitCurrentView,
    updateView,
  } = useTableViews({
    objectId: 'company',
    columnDefinitions: companiesAvailableColumnDefinitions,
  });

  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  const { setActionBarEntries } = useCompanyTableActionBarEntries();

  const updateCompany = async (
    variables: UpdateOneCompanyMutationVariables,
  ) => {
    if (variables.data.accountOwner?.connect?.id) {
      const workspaceMemberAccountOwner = (
        await getWorkspaceMember({
          variables: {
            where: {
              userId: { equals: variables.data.accountOwner.connect?.id },
            },
          },
        })
      ).data?.workspaceMembers?.[0];
      variables.data.workspaceMemberAccountOwner = {
        connect: { id: workspaceMemberAccountOwner?.id },
      };
    }

    updateEntityMutation({
      variables: variables,
      onCompleted: (data) => {
        if (!data.updateOneCompany) {
          return;
        }
        upsertDataTableItem(data.updateOneCompany);
      },
    });
  };

  return (
    <TableContext.Provider value={{ onColumnsChange: persistColumns }}>
      <DataTableEffect
        getRequestResultKey="companies"
        useGetRequest={useGetCompaniesQuery}
        getRequestOptimisticEffectDefinition={
          getCompaniesOptimisticEffectDefinition
        }
        orderBy={sortsOrderBy}
        whereFilters={filtersWhere}
        filterDefinitionArray={companiesFilters}
        sortDefinitionArray={companyAvailableSorts}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All Companies',
          onCurrentViewSubmit: submitCurrentView,
          onViewCreate: createView,
          onViewEdit: updateView,
          onViewRemove: deleteView,
          onImport: openCompanySpreadsheetImport,
          ViewBarRecoilScopeContext: TableRecoilScopeContext,
        }}
      >
        <DataTable
          updateEntityMutation={({
            variables,
          }: {
            variables: UpdateOneCompanyMutationVariables;
          }) => updateCompany(variables)}
        />
      </ViewBarContext.Provider>
    </TableContext.Provider>
  );
};
