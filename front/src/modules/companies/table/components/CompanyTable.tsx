import styled from '@emotion/styled';

import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data/data-table/hooks/useUpsertDataTableItem';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { TableOptionsHotkeyScope } from '@/ui/data/data-table/types/TableOptionsHotkeyScope';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useViewV2 } from '@/views/hooks/useViewV2';
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
import { useState } from 'react';

export const CompanyTable = () => {
  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const tableViewScopeId = 'company-table';
  const [tableColumnChanges, setTableColumnChanges] = useState([]);
  const { persistViewFields } = useViewFields(tableViewScopeId);
  const { currentViewId } = useViewV2(tableViewScopeId, ['currentViewSorts']);

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

  const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
  `;

  return (
    <ViewScope
      viewScopeId={tableViewScopeId}
      onViewFieldsChange={(viewFields) => {}}
      onViewSortsChange={() => {}}
      onViewFiltersChange={() => {}}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: (columns) => {
              //setCurrentViewFields?.(columns);
              persistViewFields(columns);
            },
          }}
        >
          <ViewBarEffect />

          <ViewBar
            optionsDropdownButton={
              <TableOptionsDropdown
                customHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
              />
            }
            optionsDropdownScopeId="table-dropdown-option"
          />
          <CompanyTableEffect tableColumnChanges={tableColumnChanges} />

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
      </StyledContainer>
    </ViewScope>
  );
};
