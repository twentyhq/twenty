import { gql } from '@apollo/client';

export const BASE_PERSON_FIELDS_FRAGMENT = gql`
  fragment basePersonFieldsFragment on Person {
    id
    phone
    email
    city
    firstName
    lastName
    displayName
    avatarUrl
    createdAt
  }
`;

export const PERSON_FIELDS_FRAGMENT = gql`
  ${BASE_PERSON_FIELDS_FRAGMENT}
  fragment personFieldsFragment on Person {
    ...basePersonFieldsFragment
    jobTitle
    linkedinUrl
    xUrl
    _activityCount
    company {
      id
      name
      domainName
    }
  }
`;
