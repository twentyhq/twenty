import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
import { TableOptionsDropdownId } from '@/ui/data/data-table/constants/TableOptionsDropdownId';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data/data-table/hooks/useUpsertDataTableItem';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { columnDefinitionsToViewFields } from '@/views/utils/columnDefinitionToViewField';
import { viewFieldsToColumnDefinitions } from '@/views/utils/viewFieldsToColumnDefinitions';
import { viewFiltersToFilters } from '@/views/utils/viewFiltersToFilters';
import { viewSortsToSorts } from '@/views/utils/viewSortsToSorts';
import {
  UpdateOneCompanyMutationVariables,
  useGetCompaniesQuery,
  useGetWorkspaceMembersLazyQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { companyTableFilterDefinitions } from '~/pages/companies/constants/companyTableFilterDefinitions';
import { companyTableSortDefinitions } from '~/pages/companies/constants/companyTableSortDefinitions';

import CompanyTableEffect from './CompanyTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const CompanyTable = () => {
  const viewScopeId = 'company-table-view';
  const tableScopeId = 'companies';
  const setTableColumns = useSetRecoilState(
    tableColumnsScopedState(tableScopeId),
  );

  const setTableFilters = useSetRecoilState(
    tableFiltersScopedState(tableScopeId),
  );

  const setTableSorts = useSetRecoilState(tableSortsScopedState(tableScopeId));

  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({
    viewScopeId,
  });

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

  const { openCompanySpreadsheetImport: onImport } =
    useSpreadsheetCompanyImport();

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={(viewFields) => {
        setTableColumns(
          viewFieldsToColumnDefinitions(
            viewFields,
            companiesAvailableFieldDefinitions,
          ),
        );
      }}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(viewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(viewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: useRecoilCallback(() => (columns) => {
              setCurrentViewFields?.(columnDefinitionsToViewFields(columns));
              persistViewFields(columnDefinitionsToViewFields(columns));
            }),
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown onImport={onImport} />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <CompanyTableEffect />
          <DataTableEffect
            getRequestResultKey="companies"
            useGetRequest={useGetCompaniesQuery}
            getRequestOptimisticEffectDefinition={
              getCompaniesOptimisticEffectDefinition
            }
            filterDefinitionArray={companyTableFilterDefinitions}
            sortDefinitionArray={companyTableSortDefinitions}
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
