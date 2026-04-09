import { gql } from '@apollo/client';

export const UPDATE_MESSAGE_FOLDERS = gql`
  mutation UpdateMessageFolders($input: UpdateMessageFoldersInput!) {
    updateMessageFolders(input: $input) {
      id
      isSynced
    }
  }
`;
