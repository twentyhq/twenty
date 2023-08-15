import { gql } from '@apollo/client';

export const GET_PERSON_COMPANY = gql`
  query GetPersonCompanyById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      company {
        id
        name
        domainName
      }
    }
  }
`;
