import { gql } from '@apollo/client';

export const SEND_MESSAGE_CAMPAIGN = gql`
  mutation SendMessageCampaign($input: SendMessageCampaignInput!) {
    sendMessageCampaign(input: $input) {
      campaignId
      queuedCount
      audience {
        totalMembers
        withoutEmail
        duplicateEmails
        overCap
        hardSuppressed
        globallyUnsubscribed
        topicUnsubscribed
        sendable
      }
    }
  }
`;
