import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import { Order_By, People_Order_By } from '../../generated/graphql';
import { SelectedSortType } from '../../components/table/table-header/interface';

export type OrderByFields = keyof People_Order_By | 'fullname' | 'company_name';

export type PeopleSelectedSortType = SelectedSortType<OrderByFields>;

const mapOrder = (order: 'asc' | 'desc'): Order_By => {
  return order === 'asc' ? Order_By.Asc : Order_By.Desc;
};

export const reduceSortsToOrderBy = (
  sorts: Array<PeopleSelectedSortType>,
): People_Order_By[] => {
  const mappedSorts = sorts.reduce((acc, sort) => {
    const id = sort.key;
    const order = mapOrder(sort.order);
    if (id === 'fullname') {
      acc['firstname'] = order;
      acc['lastname'] = order;
    } else if (id === 'company_name') {
      acc['company'] = { name: order };
    } else {
      acc[id] = order;
    }
    return acc;
  }, {} as People_Order_By);
  return [mappedSorts];
};

export const GET_PEOPLE = gql`
  query GetPeople(
    $orderBy: [people_order_by!]
    $where: people_bool_exp
    $limit: Int
  ) {
    people(order_by: $orderBy, where: $where, limit: $limit) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
      company {
        id
        name
        domain_name
      }
    }
  }
`;

export function usePeopleQuery(
  orderBy: People_Order_By[],
): QueryResult<{ people: GraphqlQueryPerson[] }> {
  return useQuery<{ people: GraphqlQueryPerson[] }>(GET_PEOPLE, {
    variables: { orderBy },
  });
}

export const defaultOrderBy: People_Order_By[] = [
  {
    created_at: Order_By.Desc,
  },
];
