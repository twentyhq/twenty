import { companiesAvailableColumnDefinitions } from '@/companies/constants/companiesAvailableColumnDefinitions';
import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { EntityTableEffect } from '@/ui/table/components/EntityTableEffect';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { filtersWhereScopedSelector } from '@/ui/view-bar/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/view-bar/states/selectors/sortsOrderByScopedSelector';
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
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const { createView, deleteView, submitCurrentView, updateView } =
    useTableViews({
      objectId: 'company',
      columnDefinitions: companiesAvailableColumnDefinitions,
    });

  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  const { setActionBarEntries } = useCompanyTableActionBarEntries();

  const updateCompany = async (
    variables: UpdateOneCompanyMutationVariables,
  ) => {
    const workspaceMemberAccountOwner = variables.data.accountOwner
      ? (
          await getWorkspaceMember({
            variables: {
              where: {
                userId: { equals: variables.data.accountOwner.connect?.id },
              },
            },
          })
        ).data?.workspaceMembers?.[0]
      : undefined;

    const data = {
      ...variables.data,
      workspaceMemberAccountOwner: {
        connect: { id: workspaceMemberAccountOwner?.id },
      },
    };

    updateEntityMutation({
      variables: {
        ...variables,
        data,
      },
      onCompleted: (data) => {
        if (!data.updateOneCompany) {
          return;
        }
        upsertEntityTableItem(data.updateOneCompany);
      },
    });
  };

  return (
    <>
      <EntityTableEffect
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
        <EntityTable
          updateEntityMutation={({
            variables,
          }: {
            variables: UpdateOneCompanyMutationVariables;
          }) => updateCompany(variables)}
        />
      </ViewBarContext.Provider>
    </>
  );
};
