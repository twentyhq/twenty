import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_THREADS = gql`
  query GetAgentChatThreads($agentId: String!) {
    threads(agentId: $agentId)
      @rest(
        type: "AgentChatThread"
        path: "/agent-chat/threads/{args.agentId}"
      ) {
      id
      agentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_AGENT_CHAT_MESSAGES = gql`
  query GetAgentChatMessages($threadId: String!) {
    messages(threadId: $threadId)
      @rest(
        type: "AgentChatMessage"
        path: "/agent-chat/messages/{args.threadId}"
      ) {
      id
      threadId
      role
      content
      createdAt
    }
  }
`;
