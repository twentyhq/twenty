import gql from 'graphql-tag';

export const SEND_EMAIL_CAMPAIGN = gql`
  mutation SendEmailCampaign($input: SendEmailCampaignInput!) {
    sendEmailCampaign(input: $input) {
      campaignId
      sentCount
      failedCount
    }
  }
`;
