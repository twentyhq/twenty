import { gql } from '@apollo/client';

export const GET_INVITE_SUGGESTIONS = gql`
  query GetInviteSuggestions {
    getInviteSuggestions {
      email
      displayName
    }
  }
`;
