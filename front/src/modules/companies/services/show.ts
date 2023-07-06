import { gql } from '@apollo/client';

import { useGetCompanyQuery } from '~/generated/graphql';

export const GET_COMPANY = gql`
  query GetCompany($id: String!) {
    findUniqueCompany(id: $id) {
      id
      domainName
      name
      createdAt
      address
      employees
      _commentCount
      accountOwner {
        id
        email
        displayName
      }
    }
  }
`;

export function useCompanyQuery(id: string) {
  return useGetCompanyQuery({ variables: { id } });
}
