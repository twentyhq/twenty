import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { getCompaniesOptimisticEffectDefinition } from '@/companies/graphql/optimistic-effect-definitions/getCompaniesOptimisticEffectDefinition';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { RecordTableEffect } from '@/ui/object/record-table/components/RecordTableEffect';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { TableContext } from '@/ui/object/record-table/contexts/TableContext';
import { useUpsertRecordTableItem } from '@/ui/object/record-table/hooks/useUpsertRecordTableItem';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { tableColumnsScopedState } from '@/ui/object/record-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { ViewScope } from '@/views/scopes/ViewScope';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
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
  const upsertRecordTableItem = useUpsertRecordTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const { persistViewFields } = useViewFields(viewScopeId);

  const { setContextMenuEntries, setActionBarEntries } =
    useCompanyTableContextMenuEntries();

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
        upsertRecordTableItem(data.updateOneCompany);
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
          mapViewFieldsToColumnDefinitions(
            viewFields,
            companiesAvailableFieldDefinitions,
          ),
        );
      }}
      onViewFiltersChange={(viewFilters) => {
        setTableFilters(mapViewFiltersToFilters(viewFilters));
      }}
      onViewSortsChange={(viewSorts) => {
        setTableSorts(mapViewSortsToSorts(viewSorts));
      }}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: useRecoilCallback(() => (columns) => {
              persistViewFields(mapColumnDefinitionsToViewFields(columns));
            }),
          }}
        >
          <ViewBar
            optionsDropdownButton={<TableOptionsDropdown onImport={onImport} />}
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <CompanyTableEffect />
          <RecordTableEffect
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
          <RecordTable
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
