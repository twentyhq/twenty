import { gql } from '@apollo/client';

export const GET_COMPANIES = gql`
  query GetCompanies(
    $orderBy: [CompanyOrderByWithRelationInput!]
    $where: CompanyWhereInput
  ) {
    companies: findManyCompany(orderBy: $orderBy, where: $where) {
      ...companyFieldsFragment
    }
  }
`;
