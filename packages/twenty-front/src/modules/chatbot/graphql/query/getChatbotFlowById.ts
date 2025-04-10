import { gql } from '@apollo/client';

export const GET_CHATBOT_FLOW_BY_ID = gql`
  query GetChatbotFlowById($chatbotId: String!) {
    getChatbotFlowById(chatbotId: $chatbotId) {
      id
      nodes
      edges
      chatbotId
      viewport
    }
  }
`;
