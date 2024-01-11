import { gql } from '@apollo/client';

import { responseData as person } from './useUpdateOneRecord';

export const query = gql`
  query FindOneperson($objectRecordId: UUID!) {
    person(filter: { id: { eq: $objectRecordId } }) {
      id
      opportunities {
        edges {
          node {
            id
          }
        }
      }
      xLink {
        label
        url
      }
      id
      pointOfContactForOpportunities {
        edges {
          node {
            id
          }
        }
      }
      createdAt
      company {
        id
      }
      city
      email
      activityTargets {
        edges {
          node {
            id
          }
        }
      }
      jobTitle
      favorites {
        edges {
          node {
            id
          }
        }
      }
      attachments {
        edges {
          node {
            id
          }
        }
      }
      name {
        firstName
        lastName
      }
      phone
      linkedinLink {
        label
        url
      }
      updatedAt
      avatarUrl
      companyId
    }
  }
`;

export const variables = {
  objectRecordId: '6205681e-7c11-40b4-9e32-f523dbe54590',
};

export const responseData = {
  ...person,
  id: '6205681e-7c11-40b4-9e32-f523dbe54590',
};
