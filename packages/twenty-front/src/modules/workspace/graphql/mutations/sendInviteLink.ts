import { gql } from '@apollo/client';

export const SEND_INVITE_LINK = gql`
  mutation SendInviteLink($emails: [String!]!) {
    sendInviteLink(emails: $emails) {
      success
    }
  }
`;
