import {
  PersonOrderByWithRelationInput,
  SortOrder,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { useSetPeopleRecordTable } from '../hooks/useSetPeopleRecordTable';

export const PeopleRecordTableDataEffect = ({
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
  const setPeopleRecordTable = useSetPeopleRecordTable();

  useGetPeopleQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const people = data.people ?? [];

      setPeopleRecordTable(people);
    },
  });

  return <></>;
};
