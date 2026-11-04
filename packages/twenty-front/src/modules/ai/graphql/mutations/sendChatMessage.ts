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
    $channelId: UUID
    $shouldAssistantReply: Boolean
    $isAssistantParticipant: Boolean
    $isAssistantMentioned: Boolean
    $recipientWorkspaceMemberIds: [UUID!]
  ) {
    sendChatMessage(
      threadId: $threadId
      text: $text
      messageId: $messageId
      browsingContext: $browsingContext
      modelId: $modelId
      fileAttachments: $fileAttachments
      mentionedWorkspaceMemberIds: $mentionedWorkspaceMemberIds
      channelId: $channelId
      shouldAssistantReply: $shouldAssistantReply
      isAssistantParticipant: $isAssistantParticipant
      isAssistantMentioned: $isAssistantMentioned
      recipientWorkspaceMemberIds: $recipientWorkspaceMemberIds
    ) {
      messageId
      queued
      streamId
      mentionedParticipantWorkspaceMemberIds
      recipientParticipantWorkspaceMemberIds
    }
  }
`;
