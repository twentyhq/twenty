import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePersonTableContextMenuEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
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
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { personTableFilterDefinitions } from '~/pages/people/constants/personTableFilterDefinitions';
import { personTableSortDefinitions } from '~/pages/people/constants/personTableSortDefinitions';

import PersonTableEffect from './PersonTableEffect';

export const PersonTable = () => {
  const viewScopeId = 'person-table-view';
  const tableScopeId = 'people';
  const setTableColumns = useSetRecoilState(
    tableColumnsScopedState(tableScopeId),
  );

  const setTableFilters = useSetRecoilState(
    tableFiltersScopedState(tableScopeId),
  );

  const setTableSorts = useSetRecoilState(tableSortsScopedState(tableScopeId));

  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({
    viewScopeId,
  });

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

  const updatePerson = async (variables: UpdateOnePersonMutationVariables) => {
    updateEntityMutation({
      variables: variables,
      onCompleted: (data) => {
        if (!data.updateOnePerson) {
          return;
        }
        upsertDataTableItem(data.updateOnePerson);
      },
    });
  };

  const { openPersonSpreadsheetImport: onImport } =
    useSpreadsheetPersonImport();

  const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
  `;

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={(viewFields) => {
        setTableColumns(
          viewFieldsToColumnDefinitions(
            viewFields,
            peopleAvailableFieldDefinitions,
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
            optionsDropdownScopeId="table-dropdown-option"
          />
          <PersonTableEffect />
          <DataTableEffect
            getRequestResultKey="people"
            useGetRequest={useGetPeopleQuery}
            getRequestOptimisticEffectDefinition={
              getPeopleOptimisticEffectDefinition
            }
            filterDefinitionArray={personTableFilterDefinitions}
            sortDefinitionArray={personTableSortDefinitions}
            setContextMenuEntries={setContextMenuEntries}
            setActionBarEntries={setActionBarEntries}
          />
          <DataTable
            updateEntityMutation={({
              variables,
            }: {
              variables: UpdateOnePersonMutationVariables;
            }) => updatePerson(variables)}
          />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
