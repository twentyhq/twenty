import gql from 'graphql-tag';

export const UPDATE_MESSAGE_FOLDERS_SYNC_STATUS = gql`
  mutation UpdateMessageFoldersSyncStatus(
    $input: UpdateMessageFoldersSyncStatusInput!
  ) {
    updateMessageFoldersSyncStatus(input: $input) {
      success
    }
  }
`;
