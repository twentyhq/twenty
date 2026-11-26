import { gql } from '@apollo/client';

export const ADD_AGENT_CHAT_THREAD_PARTICIPANTS = gql`
  mutation AddAgentChatThreadParticipants(
    $input: AddAgentChatThreadParticipantsInput!
  ) {
    addAgentChatThreadParticipants(input: $input)
  }
`;
