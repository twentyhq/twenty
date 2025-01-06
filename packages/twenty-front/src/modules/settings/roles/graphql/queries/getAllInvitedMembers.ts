import { gql } from '@apollo/client';

export const GET_ALL_INVITED_MEMBERS = gql`
  query GetAllInvitedMembers($workspaceId: ID!) {
    getAllInvitedMembers(workspaceId: $workspaceId) {
      id
      email
      createdAt
    }
  }
`;
