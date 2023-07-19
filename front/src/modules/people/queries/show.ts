import { gql } from '@apollo/client';

import { useGetPersonQuery } from '~/generated/graphql';

export const GET_PERSON = gql`
  query GetPerson($id: String!) {
    findUniquePerson(id: $id) {
      id
      firstName
      lastName
      displayName
      email
      createdAt
      city
      phone
      _commentThreadCount
      company {
        id
        name
        domainName
      }
    }
  }
`;

export function usePersonQuery(id: string) {
  return useGetPersonQuery({ variables: { id } });
}
