import { gql } from '@apollo/client';

export const UPDATE_CHATBOT_FLOW = gql`
  mutation updateChatbotFlow($updateChatbotInput: UpdateChatbotFlowInput!) {
    updateChatbotFlow(updateChatbotInput: $updateChatbotInput) {
      id
      nodes
      edges
      chatbotId
      viewport
    }
  }
`;
