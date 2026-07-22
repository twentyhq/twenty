import { gql } from '@apollo/client';

export const CAMPAIGN_SEND_QUOTA = gql`
  query CampaignSendQuota {
    campaignSendQuota {
      dailyLimit
      used
      remaining
    }
  }
`;
