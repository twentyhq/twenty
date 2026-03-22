import { gql } from '@apollo/client';

export const GET_MY_MESSAGE_FOLDERS = gql`
  query MyMessageFolders($messageChannelId: UUID) {
    myMessageFolders(messageChannelId: $messageChannelId) {
      id
      name
      isSynced
      isSentFolder
      parentFolderId
      externalId
      messageChannelId
      createdAt
      updatedAt
    }
  }
`;
