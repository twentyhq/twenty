import { gql } from '@apollo/client';

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage(
    $threadId: UUID!
    $text: String!
    $messageId: UUID!
    $browsingContext: JSON
    $companyContext: JSON
    $modelId: String
    $fileAttachments: [FileAttachmentInput!]
  ) {
    sendChatMessage(
      threadId: $threadId
      text: $text
      messageId: $messageId
      browsingContext: $browsingContext
      companyContext: $companyContext
      modelId: $modelId
      fileAttachments: $fileAttachments
    ) {
      messageId
      queued
      streamId
    }
  }
`;
