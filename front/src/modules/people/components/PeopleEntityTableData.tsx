import {
  PersonOrderByWithRelationInput,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { useSetPeopleEntityTable } from '../hooks/useSetPeopleEntityTable';
import { defaultOrderBy } from '../queries';

export function PeopleEntityTableData({
  orderBy = defaultOrderBy,
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
