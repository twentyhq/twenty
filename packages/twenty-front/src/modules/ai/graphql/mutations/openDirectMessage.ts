import { gql } from '@apollo/client';

export const OPEN_DIRECT_MESSAGE = gql`
  mutation OpenDirectMessage($workspaceMemberId: UUID!) {
    openDirectMessage(workspaceMemberId: $workspaceMemberId)
  }
`;
