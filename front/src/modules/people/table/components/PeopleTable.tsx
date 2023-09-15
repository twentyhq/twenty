import { peopleAvailableColumnDefinitions } from '@/people/constants/peopleAvailableColumnDefinitions';
import { getPeopleOptimisticEffectDefinition } from '@/people/graphql/optimistic-effect-definitions/getPeopleOptimisticEffectDefinition';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
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
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleFilters } from '~/pages/people/people-filters';
import { peopleAvailableSorts } from '~/pages/people/people-sorts';

export function PeopleTable() {
  const sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const filtersWhere = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();
  const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();

  const { createView, deleteView, submitCurrentView, updateView } =
    useTableViews({
      objectId: 'person',
      columnDefinitions: peopleAvailableColumnDefinitions,
    });

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

  function handleImport() {
    openPersonSpreadsheetImport();
  }

  return (
    <>
      <EntityTableEffect
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        getRequestOptimisticEffectDefinition={
          getPeopleOptimisticEffectDefinition
        }
        orderBy={sortsOrderBy}
        whereFilters={filtersWhere}
        filterDefinitionArray={peopleFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
        sortDefinitionArray={peopleAvailableSorts}
      />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All People',
          onCurrentViewSubmit: submitCurrentView,
          onViewCreate: createView,
          onViewEdit: updateView,
          onViewRemove: deleteView,
          onImport: handleImport,
        }}
      >
        <EntityTable
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
                upsertEntityTableItem(data.updateOnePerson);
              },
            })
          }
        />
      </ViewBarContext.Provider>
    </>
  );
}
