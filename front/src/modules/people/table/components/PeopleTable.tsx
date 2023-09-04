import { peopleAvailableColumnDefinitions } from '@/people/constants/peopleAvailableColumnDefinitions';
import { getPeopleOptimisticEffect } from '@/people/graphql/optimistic-effect-callback/getPeopleOptimisticEffect';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { filtersWhereScopedSelector } from '@/ui/filter-n-sort/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/filter-n-sort/states/selectors/sortsOrderByScopedSelector';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViews } from '@/views/hooks/useTableViews';
import {
  SortOrder,
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleFilters } from '~/pages/people/people-filters';
import { availableSorts } from '~/pages/people/people-sorts';

export function PeopleTable() {
  const orderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const whereFilters = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();
  const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();

  const { handleViewsChange, handleViewSubmit } = useTableViews({
    availableFilters: peopleFilters,
    availableSorts,
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
      <GenericEntityTableData
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        getRequestOptimisticEffect={getPeopleOptimisticEffect}
        orderBy={orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }]}
        whereFilters={whereFilters}
        filterDefinitionArray={peopleFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <EntityTable
        viewName="All People"
        availableSorts={availableSorts}
        onViewsChange={handleViewsChange}
        onViewSubmit={handleViewSubmit}
        onImport={handleImport}
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
    </>
  );
}
