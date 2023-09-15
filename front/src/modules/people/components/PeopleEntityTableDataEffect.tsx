import {
  PersonOrderByWithRelationInput,
  SortOrder,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { useSetPeopleEntityTable } from '../hooks/useSetPeopleEntityTable';

export function PeopleEntityTableDataEffect({
  orderBy = [
    {
      createdAt: SortOrder.Desc,
    },
  ],
  whereFilters,
}: {
  orderBy?: PersonOrderByWithRelationInput[];
  whereFilters?: any;
}) {
  const setPeopleEntityTable = useSetPeopleEntityTable();

  useGetPeopleQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const people = data.people ?? [];

      setPeopleEntityTable(people);
    },
  });

  return <></>;
}
