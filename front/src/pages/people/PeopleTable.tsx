import { useCallback, useMemo, useState } from 'react';
import { IconList } from '@tabler/icons-react';

import { defaultOrderBy } from '@/companies/services';
import { reduceSortsToOrderBy } from '@/filters-and-sorts/helpers';
import { selectedTableFiltersScopedState } from '@/filters-and-sorts/states/selectedTableFiltersScopedState';
import { turnFilterIntoWhereClause } from '@/filters-and-sorts/utils/turnFilterIntoWhereClause';
import { PeopleSelectedSortType, usePeopleQuery } from '@/people/services';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { TableContext } from '@/ui/tables/states/TableContext';
import { PersonOrderByWithRelationInput } from '~/generated/graphql';

import { usePeopleColumns } from './people-columns';
import { peopleFilters } from './people-filters';
import { availableSorts } from './people-sorts';

export function PeopleTable() {
  const [orderBy, setOrderBy] =
    useState<PersonOrderByWithRelationInput[]>(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const filters = useRecoilScopedValue(
    selectedTableFiltersScopedState,
    TableContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  const peopleColumns = usePeopleColumns();

  const { data } = usePeopleQuery(orderBy, whereFilters);

  const people = data?.people ?? [];

  return (
    <>
      <HooksEntityTable
        numberOfColumns={peopleColumns.length}
        numberOfRows={people.length}
        availableFilters={peopleFilters}
      />
      <EntityTable
        data={people}
        columns={peopleColumns}
        viewName="All People"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={updateSorts}
      />
    </>
  );
}
