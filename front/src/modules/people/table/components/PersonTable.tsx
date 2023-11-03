import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePersonTableContextMenuEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
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
  const upsertRecordTableItem = useUpsertRecordTableItem();

  const { persistViewFields } = useViewFields(viewScopeId);
  const { setCurrentViewFields } = useView({
    viewScopeId,
  });

  const { setContextMenuEntries, setActionBarEntries } =
    usePersonTableContextMenuEntries();

  const updatePerson = async (variables: UpdateOnePersonMutationVariables) => {
    updateEntityMutation({
      variables: variables,
      onCompleted: (data) => {
        if (!data.updateOnePerson) {
          return;
        }
        upsertRecordTableItem(data.updateOnePerson);
      },
    });
  };

  const { openPersonSpreadsheetImport: onImport } =
    useSpreadsheetPersonImport();

  const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
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
            optionsDropdownScopeId={TableOptionsDropdownId}
          />
          <PersonTableEffect />
          <RecordTableEffect
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
          <RecordTable
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
