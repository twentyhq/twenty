import { gql } from '@apollo/client';

export const COMPANY_FIELDS_FRAGMENT = gql`
  fragment CompanyFieldsFragment on Company {
    accountOwner {
      id
      email
      displayName
      avatarUrl
    }
    address
    createdAt
    domainName
    employees
    linkedinUrl
    id
    name
  }
`;
