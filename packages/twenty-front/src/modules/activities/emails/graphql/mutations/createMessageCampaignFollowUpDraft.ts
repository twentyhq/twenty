import { gql } from '@apollo/client';

export const CREATE_MESSAGE_CAMPAIGN_FOLLOW_UP_DRAFT = gql`
  mutation CreateMessageCampaignFollowUpDraft(
    $input: MessageCampaignEngagementInput!
  ) {
    createMessageCampaignFollowUpDraft(input: $input) {
      messageCampaignId
      listId
      memberCount
      skippedCount
    }
  }
`;
