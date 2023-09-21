import { gql } from '@apollo/client';

export const BASE_COMPANY_FIELDS_FRAGMENT = gql`
  fragment baseCompanyFieldsFragment on Company {
    address
    annualRecurringRevenue
    createdAt
    domainName
    employees
    id
    idealCustomerProfile
    linkedinUrl
    name
    xUrl
    _activityCount
  }
`;

export const BASE_ACCOUNT_OWNER_FRAGMENT = gql`
  fragment baseAccountOwnerFragment on User {
    id
    email
    displayName
    avatarUrl
    firstName
    lastName
  }
`;

export const COMPANY_FIELDS_FRAGMENT = gql`
  fragment companyFieldsFragment on Company {
    accountOwner {
      ...baseAccountOwnerFragment
    }
    ...baseCompanyFieldsFragment
  }
`;
