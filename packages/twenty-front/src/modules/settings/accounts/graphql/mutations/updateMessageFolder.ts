import { gql } from '@apollo/client';

export const UPDATE_MESSAGE_FOLDER = gql`
  mutation UpdateMessageFolder($input: UpdateMessageFolderInput!) {
    updateMessageFolder(input: $input) {
      id
      isSynced
    }
  }
`;
