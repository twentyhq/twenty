import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import { SelectedSortType } from '../../components/table/table-header/SortAndFilterBar';

export type OrderByFields =
  | keyof GraphqlQueryPerson
  | 'fullname'
  | 'company_name';

export type OrderBy = Partial<{
  [key in keyof GraphqlQueryPerson]:
    | 'asc'
    | 'desc'
    | { [key in string]: 'asc' | 'desc' };
}>;

export type PeopleSelectedSortType = SelectedSortType<OrderByFields>;

export const reduceSortsToOrderBy = (
  sorts: Array<PeopleSelectedSortType>,
): OrderBy[] => {
  const mappedSorts = sorts.reduce((acc, sort) => {
    const id = sort.id;
    if (id === 'fullname') {
      acc['firstname'] = sort.order;
      acc['lastname'] = sort.order;
    } else if (id === 'company_name') {
      acc['company'] = { company_name: sort.order };
    } else {
      acc[id] = sort.order;
    }
    return acc;
  }, {} as OrderBy);
  return [mappedSorts];
};

export const GET_PEOPLE = gql`
  query GetPeople($orderBy: [people_order_by!]) {
    people(order_by: $orderBy) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
      company {
        id
        company_name
        company_domain
      }
    }
  }
`;

export function usePeopleQuery(
  orderBy: OrderBy[],
): QueryResult<{ people: GraphqlQueryPerson[] }> {
  return useQuery<{ people: GraphqlQueryPerson[] }>(GET_PEOPLE, {
    variables: { orderBy },
  });
}
