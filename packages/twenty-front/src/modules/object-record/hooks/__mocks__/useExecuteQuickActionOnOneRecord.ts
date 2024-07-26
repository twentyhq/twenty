import { gql } from '@apollo/client';

export { responseData } from './useUpdateOneRecord';

export const query = gql`
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      __typename
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      id
      createdAt
      city
      email
      jobTitle
      name {
        firstName
        lastName
      }
      phone
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
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
