import { useCallback, useMemo, useState } from 'react';
import { IconList } from '@tabler/icons-react';

import { defaultOrderBy } from '@/companies/queries';
import { reduceSortsToOrderBy } from '@/lib/filters-and-sorts/helpers';
import { filtersScopedState } from '@/lib/filters-and-sorts/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/lib/filters-and-sorts/utils/turnFilterIntoWhereClause';
import { PeopleEntityTableData } from '@/people/components/PeopleEntityTableData';
import { PeopleSelectedSortType } from '@/people/services';
import { peopleColumns } from '@/people/table/components/peopleColumns';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { TableContext } from '@/ui/tables/states/TableContext';
import { PersonOrderByWithRelationInput } from '~/generated/graphql';

import { peopleFilters } from './people-filters';
import { availableSorts } from './people-sorts';

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
