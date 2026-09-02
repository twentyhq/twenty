import gql from 'graphql-tag';

export const CANCEL_MESSAGE_CAMPAIGN = gql`
  mutation CancelMessageCampaign($input: CancelMessageCampaignInput!) {
    cancelMessageCampaign(input: $input) {
      campaignId
      canceledMessageCount
    }
  }
`;
