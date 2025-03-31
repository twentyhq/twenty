import { gql } from '@apollo/client';

export const UPDATE_CHATBOT_FLOW = gql`
  mutation validateChatbotFlow($updateChatbotInput: UpdateChatbotFlowInput!) {
    validateChatbotFlow(updateChatbotInput: $updateChatbotInput)
  }
`;
