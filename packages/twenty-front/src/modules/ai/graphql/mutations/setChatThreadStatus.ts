import { gql } from '@apollo/client';

export const SET_CHAT_THREAD_STATUS = gql`
  mutation SetChatThreadStatus(
    $id: UUID!
    $status: AgentChatThreadStatus!
    $snoozedUntil: DateTime
  ) {
    setChatThreadStatus(
      id: $id
      status: $status
      snoozedUntil: $snoozedUntil
    ) {
      id
      status
      snoozedUntil
      updatedAt
    }
  }
`;
