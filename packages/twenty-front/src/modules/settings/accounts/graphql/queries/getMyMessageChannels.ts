import { gql } from '@apollo/client';

export const GET_MY_MESSAGE_CHANNELS = gql`
  query MyMessageChannels($connectedAccountId: UUID) {
    myMessageChannels(connectedAccountId: $connectedAccountId) {
      id
      handle
      visibility
      type
      isContactAutoCreationEnabled
      contactAutoCreationPolicy
      messageFolderImportPolicy
      excludeNonProfessionalEmails
      excludeGroupEmails
      isSyncEnabled
      syncStatus
      syncStage
      syncStageStartedAt
      connectedAccountId
      createdAt
      updatedAt
    }
  }
`;
