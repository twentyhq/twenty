import gql from 'graphql-tag';

export const SAVE_MASS_EMAIL_CAMPAIGN_DRAFT = gql`
  mutation SaveMassEmailCampaignDraft(
    $input: SaveMassEmailCampaignDraftInput!
  ) {
    saveMassEmailCampaignDraft(input: $input) {
      campaignId
      updatedAt
    }
  }
`;

export const SEND_MASS_EMAIL_CAMPAIGN = gql`
  mutation SendMassEmailCampaign($input: SendMassEmailCampaignInput!) {
    sendMassEmailCampaign(input: $input) {
      campaignId
      sentCount
      failedRecipients
    }
  }
`;
