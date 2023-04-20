import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import { peopleColumns } from './people-table';
import { gql, useQuery } from '@apollo/client';
import {
  GraphqlPerson,
  Person,
  mapPerson,
} from '../../interfaces/person.interface';
import { defaultData } from './default-data';
import { useState } from 'react';
import { SortType } from '../../components/table/table-header/SortAndFilterBar';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const GET_PEOPLE = gql`
  query GetPeople($orderBy: [person_order_by!]) {
    person(order_by: $orderBy) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
      company {
        company_name
        company_domain
      }
    }
  }
`;

// @TODO get those types from generated-code person-order-by
type OrderBy = Record<string, 'asc' | 'desc'>;

const defaultOrderBy = [
  {
    created_at: 'desc',
  },
];

const reduceSortsToGqlSorts = (sorts: Array<SortType>): OrderBy[] => {
  const mappedSorts = sorts.reduce((acc, sort) => {
    acc[sort.id] = sort.order;
    return acc;
  }, {} as OrderBy);
  return [mappedSorts];
};

function People() {
  const [sorts, setSorts] = useState([] as Array<SortType>);
  const orderBy = sorts.length ? reduceSortsToGqlSorts(sorts) : defaultOrderBy;
  const { data } = useQuery<{ person: GraphqlPerson[] }>(GET_PEOPLE, {
    variables: { orderBy: orderBy },
  });

  const mydata: Person[] = data ? data.person.map(mapPerson) : defaultData;

  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <StyledPeopleContainer>
        {mydata && (
          <Table
            data={mydata}
            columns={peopleColumns}
            viewName="All People"
            viewIcon={faList}
            setSorts={setSorts}
          />
        )}
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
