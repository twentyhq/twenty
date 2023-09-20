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

export const COMPANY_FIELDS_FRAGMENT = gql`
  fragment companyFieldsFragment on Company {
    accountOwner {
      id
      email
      displayName
      avatarUrl
    }
    ...baseCompanyFieldsFragment
  }
`;
