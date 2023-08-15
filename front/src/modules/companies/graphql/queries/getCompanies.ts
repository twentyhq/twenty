import { gql } from '@apollo/client';

export const GET_COMPANIES = gql`
  query GetCompanies(
    $orderBy: [CompanyOrderByWithRelationInput!]
    $where: CompanyWhereInput
  ) {
    companies: findManyCompany(orderBy: $orderBy, where: $where) {
      id
      domainName
      name
      createdAt
      address
      linkedinUrl
      employees
      _activityCount
      accountOwner {
        id
        email
        displayName
        firstName
        lastName
        avatarUrl
      }
    }
  }
`;
