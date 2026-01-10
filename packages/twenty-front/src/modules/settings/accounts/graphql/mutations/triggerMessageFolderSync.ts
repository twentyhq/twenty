import gql from 'graphql-tag';

export const TRIGGER_MESSAGE_FOLDER_SYNC = gql`
  mutation TriggerMessageFolderSync($messageFolderId: UUID!) {
    triggerMessageFolderSync(messageFolderId: $messageFolderId) {
      success
    }
  }
`;
