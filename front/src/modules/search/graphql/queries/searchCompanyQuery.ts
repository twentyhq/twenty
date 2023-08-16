import { gql } from '@apollo/client';

export const SEARCH_COMPANY_QUERY = gql`
  query SearchCompany(
    $where: CompanyWhereInput
    $limit: Int
    $orderBy: [CompanyOrderByWithRelationInput!]
  ) {
    searchResults: findManyCompany(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      ...CompanyFieldsFragment
    }
  }
`;
