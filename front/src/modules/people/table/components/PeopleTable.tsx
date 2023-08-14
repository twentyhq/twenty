import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { peopleViewFields } from '@/people/constants/peopleViewFields';
import { useActionBarEntries } from '@/people/hooks/useActionBarEntries';
import { useContextMenuEntries } from '@/people/hooks/useContextMenuEntries';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsOrderByScopedState } from '@/ui/filter-n-sort/states/sortScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useViewSorts } from '@/views/hooks/useViewSorts';
import { currentViewIdState } from '@/views/states/currentViewIdState';
import {
  UpdateOnePersonMutationVariables,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleFilters } from '~/pages/people/people-filters';
import { availableSorts } from '~/pages/people/people-sorts';

import { defaultOrderBy } from '../../queries';

export function PeopleTable() {
  const currentViewId = useRecoilValue(currentViewIdState);
  const orderBy = useRecoilScopedValue(
    sortsOrderByScopedState,
    TableRecoilScopeContext,
  );
  const [updateEntityMutation] = useUpdateOnePersonMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();

  const { handleColumnsChange } = useTableViewFields({
    objectName: 'person',
    viewFieldDefinitions: peopleViewFields,
  });
  const { updateSorts } = useViewSorts({
    availableSorts,
    Context: TableRecoilScopeContext,
  });

  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  const setContextMenu = useContextMenuEntries();
  const setActionBar = useActionBarEntries();

  return (
    <>
      <GenericEntityTableData
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        orderBy={orderBy.length ? orderBy : defaultOrderBy}
        whereFilters={whereFilters}
        filterDefinitionArray={peopleFilters}
        setContextMenu={setContextMenu}
        setActionBar={setActionBar}
      />
      <EntityTable
        viewName="All People"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onColumnsChange={handleColumnsChange}
        onSortsUpdate={currentViewId ? updateSorts : undefined}
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
