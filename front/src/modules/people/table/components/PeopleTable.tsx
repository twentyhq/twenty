import { useCallback } from 'react';

import { peopleViewFields } from '@/people/constants/peopleViewFields';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { filtersWhereScopedSelector } from '@/ui/filter-n-sort/states/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/filter-n-sort/states/sortsOrderByScopedSelector';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useTableViews } from '@/views/hooks/useTableViews';
import { useViewFilters } from '@/views/hooks/useViewFilters';
import { useViewSorts } from '@/views/hooks/useViewSorts';
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

  const objectId = 'person';
  const { handleViewsChange } = useTableViews({
    availableFilters: peopleFilters,
    availableSorts,
    objectId,
  });
  const { handleColumnsChange } = useTableViewFields({
    objectName: objectId,
    viewFieldDefinitions: peopleViewFields,
  });
  const { persistFilters } = useViewFilters({
    availableFilters: peopleFilters,
  });
  const { persistSorts } = useViewSorts({ availableSorts });

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

  const handleViewSubmit = useCallback(async () => {
    await persistFilters();
    await persistSorts();
  }, [persistFilters, persistSorts]);

  function handleImport() {
    openPersonSpreadsheetImport();
  }

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        orderBy={orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }]}
        whereFilters={whereFilters}
        filterDefinitionArray={peopleFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <EntityTable
        viewName="All People"
        availableSorts={availableSorts}
        onColumnsChange={handleColumnsChange}
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
