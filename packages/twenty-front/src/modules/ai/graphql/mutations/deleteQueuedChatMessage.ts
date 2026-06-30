import { gql } from '@apollo/client';

export const DELETE_QUEUED_CHAT_MESSAGE = gql`
  mutation DeleteQueuedChatMessage($messageId: UUID!) {
    deleteQueuedChatMessage(messageId: $messageId)
  }
`;
