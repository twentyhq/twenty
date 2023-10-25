import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { DataTableEffect } from '@/ui/data/data-table/components/DataTableEffect';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data/data-table/hooks/useUpsertDataTableItem';
import { SortScope } from '@/ui/data/sort/scopes/SortScope';
import { ViewScope } from '@/views/scopes/ViewScope';
import {
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleFilters } from '~/pages/people/people-filters';
import { peopleAvailableSorts } from '~/pages/people/people-sorts';

export const PeopleTable = () => {
  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const tableViewScopeId = 'people-table';

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

  return (
    <ViewScope viewScopeId={tableViewScopeId}>
      <SortScope sortScopeId={tableViewScopeId}>
        <TableContext.Provider
          value={{
            onColumnsChange: () => {
              // eslint-disable-next-line no-console
              console.log('persist columns');
            },
          }}
        >
          <DataTableEffect
            getRequestResultKey="people"
            useGetRequest={useGetPeopleQuery}
            getRequestOptimisticEffectDefinition={
              getPeopleOptimisticEffectDefinition
            }
            filterDefinitionArray={peopleFilters}
            setContextMenuEntries={setContextMenuEntries}
            setActionBarEntries={setActionBarEntries}
            sortDefinitionArray={peopleAvailableSorts}
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
      </SortScope>
    </ViewScope>
  );
};
