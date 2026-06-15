import gql from 'graphql-tag';

export const PREVIEW_MESSAGE_CAMPAIGN_AUDIENCE = gql`
  query PreviewMessageCampaignAudience(
    $input: PreviewMessageCampaignAudienceInput!
  ) {
    previewMessageCampaignAudience(input: $input) {
      totalMembers
      withoutEmail
      duplicateEmails
      globallyUnsubscribed
      topicUnsubscribed
      sendable
    }
  }
`;
