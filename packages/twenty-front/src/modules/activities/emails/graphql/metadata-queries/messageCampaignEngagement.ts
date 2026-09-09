import gql from 'graphql-tag';

export const MESSAGE_CAMPAIGN_ENGAGEMENT = gql`
  query MessageCampaignEngagement($input: MessageCampaignEngagementInput!) {
    messageCampaignEngagement(input: $input) {
      isAvailable
      isClickTrackingEnabled
      calculatedAt
      totalClicks
      uniqueClickers
      series {
        bucketStart
        clicks
      }
      links {
        authoredUrl
        uniqueClickers
        totalClicks
      }
      recipients {
        deliveryId
        personId
        firstClickedAt
        lastEngagedAt
      }
    }
  }
`;
