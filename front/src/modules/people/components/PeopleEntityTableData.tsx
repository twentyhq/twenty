import { useRecoilState } from 'recoil';

import { isFetchingEntityTableDataState } from '@/ui/tables/states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '@/ui/tables/states/tableRowIdsState';
import {
  PersonOrderByWithRelationInput,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { useSetPeopleEntityTable } from '../hooks/useSetPeopleEntityTable';
import { defaultOrderBy } from '../services';

export function PeopleEntityTableData({
  orderBy = defaultOrderBy,
  whereFilters,
}: {
  orderBy?: PersonOrderByWithRelationInput[];
  whereFilters?: any;
}) {
  const [, setTableRowIds] = useRecoilState(tableRowIdsState);

  const [, setIsFetchingEntityTableData] = useRecoilState(
    isFetchingEntityTableDataState,
  );

  const setPeopleEntityTable = useSetPeopleEntityTable();

  useGetPeopleQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const people = data.people ?? [];

      const peopleIds = people.map((person) => person.id);

      setTableRowIds((currentRowIds) => {
        if (JSON.stringify(currentRowIds) !== JSON.stringify(peopleIds)) {
          return peopleIds;
        }

        return currentRowIds;
      });

      setPeopleEntityTable(people);

      setIsFetchingEntityTableData(false);
    },
  });

  return <></>;
}
