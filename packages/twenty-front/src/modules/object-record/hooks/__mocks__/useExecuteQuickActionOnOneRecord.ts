import { gql } from '@apollo/client';

export { responseData } from './useUpdateOneRecord';

export const query = gql`
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      id
      opportunities {
        edges {
          node {
            __typename
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
            __typename
            id
          }
        }
      }
      createdAt
      company {
        __typename
        id
      }
      city
      email
      activityTargets {
        edges {
          node {
            __typename
            id
          }
        }
      }
      jobTitle
      favorites {
        edges {
          node {
            __typename
            id
          }
        }
      }
      attachments {
        edges {
          node {
            __typename
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
  idToExecuteQuickActionOn: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
};
