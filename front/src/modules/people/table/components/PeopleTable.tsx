import styled from '@emotion/styled';

import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data/data-table/hooks/useUpsertDataTableItem';
import { TableOptionsDropdown } from '@/ui/data/data-table/options/components/TableOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { useView } from '@/views/hooks/useView';
import { ViewScope } from '@/views/scopes/ViewScope';
import {
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleAvailableFilters } from '~/pages/people/people-filters';
import { peopleAvailableSorts } from '~/pages/people/people-sorts';

import PersonTableEffect from './PersonTableEffect';

export const PeopleTable = () => {
  const tableViewScopeId = 'person-table';

  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const { persistViewFields } = useViewFields(tableViewScopeId);
  const { setCurrentViewFields } = useView({ viewScopeId: tableViewScopeId });

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

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
      viewScopeId={tableViewScopeId}
      onViewFieldsChange={() => {}}
      onViewSortsChange={() => {}}
      onViewFiltersChange={() => {}}
    >
      <StyledContainer>
        <TableContext.Provider
          value={{
            onColumnsChange: (columns) => {
              setCurrentViewFields?.(columns);
              persistViewFields(columns);
            },
          }}
        >
          <ViewBarEffect />

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
            filterDefinitionArray={peopleAvailableFilters}
            sortDefinitionArray={peopleAvailableSorts}
            setContextMenuEntries={setContextMenuEntries}
            setActionBarEntries={setActionBarEntries}
          />
          <DataTable
            updateEntityMutation={({
              variables,
            }: {
              variables: UpdateOnePersonMutationVariables;
            }) =>
              updateEntityMutation({
                variables,
                onCompleted: (data) => {
                  if (!data.updateOnePerson) {
                    return;
                  }
                  upsertDataTableItem(data.updateOnePerson);
                },
              })
            }
          />
        </TableContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
