import { faUser, faList } from '@fortawesome/pro-regular-svg-icons';
import WithTopBarContainer from '../../layout/containers/WithTopBarContainer';
import Table from '../../components/table/Table';
import styled from '@emotion/styled';
import { peopleColumns } from './people-table';
import { gql, useQuery } from '@apollo/client';
import { GraphqlPerson, Person } from './types';
import { defaultData } from './defaultData';

const StyledPeopleContainer = styled.div`
  display: flex;
  width: 100%;
`;

const GET_PEOPLE = gql`
  query GetPeople {
    person {
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

function People() {
  const { data } = useQuery<{ person: GraphqlPerson[] }>(GET_PEOPLE);

  const mydata: Person[] = data
    ? data.person.map((person) => ({
        fullName: `${person.firstname} ${person.lastname}`,
        creationDate: new Date(person.created_at),
        pipe: { name: 'coucou', id: 1, icon: 'faUser' },
        ...person,
        company: {
          id: 1,
          name: person.company.company_name,
          domain: person.company.company_domain,
        },
        countryCode: 'FR',
      }))
    : defaultData;

  return (
    <WithTopBarContainer title="People" icon={faUser}>
      <StyledPeopleContainer>
        {mydata && (
          <Table
            data={mydata}
            columns={peopleColumns}
            viewName="All People"
            viewIcon={faList}
          />
        )}
      </StyledPeopleContainer>
    </WithTopBarContainer>
  );
}

export default People;
