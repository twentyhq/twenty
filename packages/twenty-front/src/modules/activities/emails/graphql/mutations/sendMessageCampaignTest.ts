import { gql } from '@apollo/client';

export const SEND_MESSAGE_CAMPAIGN_TEST = gql`
  mutation SendMessageCampaignTest($input: SendMessageCampaignTestInput!) {
    sendMessageCampaignTest(input: $input) {
      messageId
    }
  }
`;
