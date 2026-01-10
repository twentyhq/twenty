import gql from 'graphql-tag';

export const DRY_RUN_MESSAGE_FOLDER_SYNC = gql`
  query DryRunMessageFolderSync($messageFolderId: UUID!) {
    dryRunMessageFolderSync(messageFolderId: $messageFolderId) {
      totalMessagesInFolder
      messagesToImport
      alreadyImported
    }
  }
`;
