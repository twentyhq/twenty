import { gql } from '@apollo/client';

export const UPDATE_INBOX_NOTIFICATION_SETTINGS = gql`
  mutation UpdateInboxNotificationSettings(
    $input: UpdateInboxNotificationSettingsInput!
  ) {
    updateInboxNotificationSettings(input: $input) {
      id
      inboxNotificationLevel
      isInboxNotificationPreviewEnabled
    }
  }
`;
