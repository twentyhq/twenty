import { gql } from '@apollo/client';

export const DELETE_INVITATION = gql`
  mutation DeleteCustomInvitation($invitationId: String!) {
    deleteCustomInvitation(invitationId: $invitationId)
  }
`;
