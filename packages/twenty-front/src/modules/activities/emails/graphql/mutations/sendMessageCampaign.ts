import gql from 'graphql-tag';

export const SEND_MESSAGE_CAMPAIGN = gql`
  mutation SendMessageCampaign($input: SendMessageCampaignInput!) {
    sendMessageCampaign(input: $input) {
      campaignId
      queuedCount
      skipped {
        noEmail
        deduped
        overCap
      }
    }
  }
`;
