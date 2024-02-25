import { gql } from '@apollo/client';

export const participantFragment = gql`
  fragment ParticipantFragment on TimelineThreadParticipant {
    personId
    workspaceMemberId
    firstName
    lastName
    displayName
    avatarUrl
    handle
  }
`;
