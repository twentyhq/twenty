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
      title
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
        path: "/agent-chat/threads/{args.threadId}/messages"
      ) {
      id
      threadId
      role
      content
      createdAt
      files
    }
  }
`;

export const STREAM_CHAT_QUERY = gql`
  query StreamChatResponse($requestBody: JSON!) {
    streamChatResponse(requestBody: $requestBody)
      @stream(
        type: "StreamChatResponse"
        path: "/agent-chat/stream"
        method: "POST"
        bodyKey: "requestBody"
      )
  }
`;
