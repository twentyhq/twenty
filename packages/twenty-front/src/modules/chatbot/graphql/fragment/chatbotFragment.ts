import { gql } from '@apollo/client';

export const GET_CHATBOTS_FRAGMENT = gql`
  fragment GetChatbotsFragment on ChatbotWorkspaceEntity {
    id
    name
    statuses
  }
`;
