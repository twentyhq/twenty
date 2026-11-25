import { gql } from '@apollo/client';

export const UPDATE_TAB_PRESENCE = gql`
  mutation UpdateTabPresence($input: UpdateTabPresenceInput!) {
    updateTabPresence(input: $input)
  }
`;
