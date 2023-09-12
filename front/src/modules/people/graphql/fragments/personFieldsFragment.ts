import { gql } from '@apollo/client';

export const PERSON_FIELDS_FRAGMENT = gql`
  fragment personFieldsFragment on Person {
    id
    phone
    email
    city
    firstName
    lastName
    displayName
    jobTitle
    linkedinUrl
    xUrl
    avatarUrl
    createdAt
    _activityCount
    company {
      id
      name
      domainName
    }
  }
`;
