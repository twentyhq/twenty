import gql from 'graphql-tag';

export const MESSAGE_CAMPAIGN_SUMMARY_FIELDS = gql`
  fragment MessageCampaignSummaryFields on MessageCampaignSummary {
    id
    subject
    status
    fromAddress
    listId
    listName
    creatorWorkspaceMemberId
    creatorName
    createdAt
    updatedAt
    sentAt
    recipientCount
    sentCount
    failedCount
    bouncedCount
    complainedCount
  }
`;

export const GET_MESSAGE_CAMPAIGNS = gql`
  ${MESSAGE_CAMPAIGN_SUMMARY_FIELDS}
  query GetMessageCampaigns {
    messageCampaigns {
      ...MessageCampaignSummaryFields
    }
  }
`;

export const GET_MESSAGE_CAMPAIGN = gql`
  query GetMessageCampaign($id: String!) {
    messageCampaign(id: $id) {
      id
      subject
      status
      fromAddress
      listId
      listName
      creatorWorkspaceMemberId
      creatorName
      createdAt
      updatedAt
      sentAt
      recipientCount
      sentCount
      failedCount
      bouncedCount
      complainedCount
      body
      unsubscribeTopicId
      canEdit
      recipients {
        messageId
        personId
        displayName
        email
        deliveryStatus
        subject
        body
      }
    }
  }
`;
