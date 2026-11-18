import { gql } from '@apollo/client';

export const UPDATE_INBOX_PRESENCE = gql`
  mutation UpdateInboxPresence($input: UpdateInboxPresenceInput!) {
    updateInboxPresence(input: $input)
  }
`;
