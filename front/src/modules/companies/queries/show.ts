import { gql } from '@apollo/client';

import { useGetCompanyQuery } from '~/generated/graphql';

export const GET_COMPANY = gql`
  query GetCompany($where: CompanyWhereUniqueInput!) {
    findUniqueCompany(where: $where) {
      id
      domainName
      name
      createdAt
      address
      linkedinUrl
      employees
      _commentThreadCount
      accountOwner {
        id
        email
        displayName
        avatarUrl
      }
    }
  }
`;

export function useCompanyQuery(id: string) {
  return useGetCompanyQuery({ variables: { where: { id } } });
}
