import { gql } from '@apollo/client';

export const LEAVE_CHAT_CHANNEL = gql`
  mutation LeaveChatChannel($id: UUID!) {
    leaveChatChannel(id: $id)
  }
`;
