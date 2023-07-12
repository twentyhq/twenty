import { useCallback, useMemo, useState } from 'react';
import { IconList } from '@tabler/icons-react';

import { defaultOrderBy } from '@/companies/services';
import { reduceSortsToOrderBy } from '@/filters-and-sorts/helpers';
import { activeTableFiltersScopedState } from '@/filters-and-sorts/states/activeTableFiltersScopedState';
import { turnFilterIntoWhereClause } from '@/filters-and-sorts/utils/turnFilterIntoWhereClause';
import { PeopleEntityTableData } from '@/people/components/PeopleEntityTableData';
import { PeopleSelectedSortType, usePeopleQuery } from '@/people/services';
import { peopleColumns } from '@/people/table/components/peopleColumns';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { EntityTable } from '@/ui/components/table/EntityTableV2';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTableV2';
import { TableContext } from '@/ui/tables/states/TableContext';
import { PersonOrderByWithRelationInput } from '~/generated/graphql';

import { peopleFilters } from './people-filters';
import { availableSorts } from './people-sorts';

export function PeopleTable() {
  console.log('PeopleTable');
  const [orderBy, setOrderBy] =
    useState<PersonOrderByWithRelationInput[]>(defaultOrderBy);

  const updateSorts = useCallback((sorts: Array<PeopleSelectedSortType>) => {
    setOrderBy(sorts.length ? reduceSortsToOrderBy(sorts) : defaultOrderBy);
  }, []);

  const filters = useRecoilScopedValue(
    activeTableFiltersScopedState,
    TableContext,
  );

  const whereFilters = useMemo(() => {
    return { AND: filters.map(turnFilterIntoWhereClause) };
  }, [filters]) as any;

  return (
    <>
      <PeopleEntityTableData orderBy={orderBy} whereFilters={whereFilters} />
      <HooksEntityTable
        numberOfColumns={peopleColumns.length}
        availableTableFilters={peopleFilters}
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
