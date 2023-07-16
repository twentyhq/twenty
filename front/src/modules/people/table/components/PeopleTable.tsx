import { useCallback, useMemo, useState } from 'react';

import { defaultOrderBy } from '@/companies/queries';
import { PeopleEntityTableData } from '@/people/components/PeopleEntityTableData';
import { PeopleSelectedSortType } from '@/people/queries';
import { peopleColumns } from '@/people/table/components/peopleColumns';
import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { IconList } from '@/ui/icon';
import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { HooksEntityTable } from '@/ui/table/components/HooksEntityTable';
import { TableContext } from '@/ui/table/states/TableContext';
import { PersonOrderByWithRelationInput } from '~/generated/graphql';
import { availableSorts } from '~/pages/companies/companies-sorts';
import { peopleFilters } from '~/pages/people/people-filters';

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
      <PeopleEntityTableData orderBy={orderBy} whereFilters={whereFilters} />
      <HooksEntityTable
        numberOfColumns={peopleColumns.length}
        availableFilters={peopleFilters}
      />
      <EntityTable
        columns={peopleColumns}
        viewName="All People"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        onSortsUpdate={updateSorts}
      />
    </>
  );
}
