import { useCallback, useMemo, useState } from 'react';

import { defaultOrderBy } from '@/companies/queries';
import { peopleViewFields } from '@/people/constants/peopleViewFields';
import { PeopleSelectedSortType } from '@/people/queries';
import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { GenericEntityTableData } from '@/ui/table/components/GenericEntityTableData';
import { TableContext } from '@/ui/table/states/TableContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  PersonOrderByWithRelationInput,
  useGetPeopleQuery,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';
import { peopleFilters } from '~/pages/people/people-filters';
import { availableSorts } from '~/pages/people/people-sorts';

export function PeopleTable() {
  const [orderBy, setOrderBy] =
    useState<PersonOrderByWithRelationInput[]>(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const filters = useRecoilScopedValue(filtersScopedState, TableContext);

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  return (
    <>
      <GenericEntityTableData
        objectName="person"
        getRequestResultKey="people"
        useGetRequest={useGetPeopleQuery}
        orderBy={orderBy}
        whereFilters={whereFilters}
        viewFieldDefinitions={peopleViewFields}
        filterDefinitionArray={peopleFilters}
      />
      <EntityTable
        viewName="All People"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={updateSorts}
        useUpdateEntityMutation={useUpdateOnePersonMutation}
      />
    </>
  );
}
