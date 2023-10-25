/* eslint-disable no-console */
import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data/data-table/hooks/useUpsertDataTableItem';
import { TableOptionsDropdownButton } from '@/ui/data/data-table/options/components/TableOptionsDropdownButton';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import {
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useGetWorkspaceMembersLazyQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companyAvailableFilters } from '~/pages/companies/companies-filters';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

import CompanyTableEffect from './CompanyTableEffect';

export const CompanyTable = () => {
  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const tableViewScopeId = 'company-table';

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
    <ViewScope
      viewScopeId={tableViewScopeId}
      onViewFieldsChange={() => {
        console.log('view fields change');
      }}
      onViewSortsChange={() => {
        console.log('view sorts change');
      }}
      onViewFiltersChange={() => {
        console.log('view filters change');
      }}
    >
      <ViewBar
        optionsDropdownButton={<TableOptionsDropdownButton />}
        optionsDropdownScopeId="table-dropdown-option"
      />
      <TableContext.Provider
        value={{
          onColumnsChange: () => {
            console.log('table column change');
          },
        }}
      >
        <CompanyTableEffect />
        <DataTableEffect
          getRequestResultKey="companies"
          useGetRequest={useGetCompaniesQuery}
          getRequestOptimisticEffectDefinition={
            getCompaniesOptimisticEffectDefinition
          }
          filterDefinitionArray={companyAvailableFilters}
          sortDefinitionArray={companyAvailableSorts}
          setContextMenuEntries={setContextMenuEntries}
          setActionBarEntries={setActionBarEntries}
        />
        <DataTable
          updateEntityMutation={({
            variables,
          }: {
            variables: UpdateOneCompanyMutationVariables;
          }) => updateCompany(variables)}
        />
      </TableContext.Provider>
    </ViewScope>
  );
};
