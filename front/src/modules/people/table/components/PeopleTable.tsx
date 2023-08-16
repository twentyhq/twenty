import { useMemo } from 'react';

import { peopleViewFields } from '@/people/constants/peopleViewFields';
import { usePersonTableContextMenuEntries } from '@/people/hooks/usePeopleTableContextMenuEntries';
import { usePersonTableActionBarEntries } from '@/people/hooks/usePersonTableActionBarEntries';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsOrderByScopedState } from '@/ui/filter-n-sort/states/sortScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useTableViews } from '@/views/hooks/useTableViews';
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
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const orderBy = useRecoilScopedValue(
    sortsOrderByScopedState,
    TableRecoilScopeContext,
  );
  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const objectId = 'person';
  const { handleViewsChange } = useTableViews({ objectId });
  const { handleColumnsChange } = useTableViewFields({
    objectName: objectId,
    viewFieldDefinitions: peopleViewFields,
  });
  const { handleSortsChange } = useViewSorts({ availableSorts });

  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  const { setContextMenuEntries } = usePersonTableContextMenuEntries();
  const { setActionBarEntries } = usePersonTableActionBarEntries();

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        orderBy={
          orderBy.length
            ? orderBy
            : [
                {
                  createdAt: SortOrder.Desc,
                },
              ]
        }
        whereFilters={whereFilters}
        filterDefinitionArray={peopleFilters}
        setContextMenuEntries={setContextMenuEntries}
        setActionBarEntries={setActionBarEntries}
      />
      <EntityTable
        viewName="All People"
        availableSorts={availableSorts}
        onColumnsChange={handleColumnsChange}
        onSortsUpdate={currentViewId ? handleSortsChange : undefined}
        onViewsChange={handleViewsChange}
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
