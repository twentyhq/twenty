import gql from 'graphql-tag';

export const SEND_MESSAGE_CAMPAIGN_TEST = gql`
  mutation SendMessageCampaignTest($input: SendMessageCampaignTestInput!) {
    sendMessageCampaignTest(input: $input) {
      messageId
    }
  }
`;
