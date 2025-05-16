import { GET_CHATBOTS_FRAGMENT } from '@/chatbot/graphql/fragment/chatbotFragment';
import { gql } from '@apollo/client';

export const GET_CHATBOTS = gql`
  ${GET_CHATBOTS_FRAGMENT}

  query GetChatbots {
    getChatbots {
      ...GetChatbotsFragment
    }
  }
`;
