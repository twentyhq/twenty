import { gql } from '@apollo/client';

export const VALIDATE_CHATBOT_FLOW = gql`
  mutation validateChatbotFlow($chatbotInput: ChatbotFlowInput!) {
    validateChatbotFlow(chatbotInput: $chatbotInput) {
      id
      nodes
      edges
      chatbotId
      workspace {
        id
        displayName
      }
    }
  }
`;
