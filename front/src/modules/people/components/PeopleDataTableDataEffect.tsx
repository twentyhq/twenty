import {
  PersonOrderByWithRelationInput,
  SortOrder,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { useSetPeopleDataTable } from '../hooks/useSetPeopleDataTable';

export const PeopleDataTableDataEffect = ({
  orderBy = [
    {
      createdAt: SortOrder.Desc,
    },
  ],
  whereFilters,
}: {
  orderBy?: PersonOrderByWithRelationInput[];
  whereFilters?: any;
}) => {
  const setPeopleDataTable = useSetPeopleDataTable();

  useGetPeopleQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const people = data.people ?? [];

      setPeopleDataTable(people);
    },
  });

  return <></>;
};
