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
      _commentThreadCount
      company {
        id
      }
    }
  }
`;

export function usePersonQuery(id: string) {
  return useGetPersonQuery({ variables: { id } });
}
