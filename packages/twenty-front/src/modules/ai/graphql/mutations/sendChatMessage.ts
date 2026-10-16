import { gql } from '@apollo/client';

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage(
    $threadId: UUID!
    $text: String!
    $messageId: UUID!
    $browsingContext: JSON
    $modelId: String
    $fileAttachments: [FileAttachmentInput!]
    $mentionedWorkspaceMemberIds: [UUID!]
    $shouldAssistantReply: Boolean
  ) {
    sendChatMessage(
      threadId: $threadId
      text: $text
      messageId: $messageId
      browsingContext: $browsingContext
      modelId: $modelId
      fileAttachments: $fileAttachments
      mentionedWorkspaceMemberIds: $mentionedWorkspaceMemberIds
      shouldAssistantReply: $shouldAssistantReply
    ) {
      messageId
      queued
      streamId
      mentionedParticipantWorkspaceMemberIds
    }
  }
`;
