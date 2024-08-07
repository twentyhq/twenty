import { gql } from '@apollo/client';

export { responseData } from './useUpdateOneRecord';

export const query = gql`
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      __typename
      updatedAt
      myCustomObjectId
      whatsapp
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      name {
        firstName
        lastName
      }
      email
      position
      createdBy {
        source
        workspaceMemberId
        name
      }
      avatarUrl
      jobTitle
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
      }
      performanceRating
      createdAt
      phone
      id
      city
      companyId
      intro
      workPrefereance
    }
  }
`;

export const variables = {
  idToExecuteQuickActionOn: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
};
