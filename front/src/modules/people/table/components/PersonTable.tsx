import styled from '@emotion/styled';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePersonTableContextMenuEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { RecordTableEffect } from '@/ui/object/record-table/components/RecordTableEffect';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useUpsertRecordTableItem } from '@/ui/object/record-table/hooks/useUpsertRecordTableItem';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { RecordTableScope } from '@/ui/object/record-table/scopes/RecordTableScope';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
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

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableScopeId: tableScopeId,
  });

  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertRecordTableItem = useUpsertRecordTableItem();

  const { persistViewFields } = useViewFields(viewScopeId);

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

  const handleColumnChange = (columns: ColumnDefinition<FieldMetadata>[]) => {
    persistViewFields(mapColumnDefinitionsToViewFields(columns));
  };

  const { openPersonSpreadsheetImport: onImport } =
    useSpreadsheetPersonImport();

  const { setEntityCountInCurrentView } = useView({ viewScopeId });

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
          mapViewFieldsToColumnDefinitions(
            viewFields,
            peopleAvailableFieldDefinitions,
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
        <ViewBar
          optionsDropdownButton={<TableOptionsDropdown onImport={onImport} />}
          optionsDropdownScopeId={TableOptionsDropdownId}
        />
        <RecordTableScope
          recordTableScopeId={tableScopeId}
          onColumnsChange={handleColumnChange}
          onEntityCountChange={(entityCount) => {
            setEntityCountInCurrentView(entityCount);
          }}
        >
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
        </RecordTableScope>
      </StyledContainer>
    </ViewScope>
  );
};
