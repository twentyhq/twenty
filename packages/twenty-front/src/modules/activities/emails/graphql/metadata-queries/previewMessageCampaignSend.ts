import gql from 'graphql-tag';

export const PREVIEW_MESSAGE_CAMPAIGN_SEND = gql`
  query PreviewMessageCampaignSend($input: PreviewMessageCampaignSendInput!) {
    previewMessageCampaignSend(input: $input) {
      audience {
        totalMembers
        withoutEmail
        duplicateEmails
        hardSuppressed
        globallyUnsubscribed
        topicUnsubscribed
        trackingRefused
        sendable
      }
      blockers {
        code
        message
      }
    }
  }
`;
