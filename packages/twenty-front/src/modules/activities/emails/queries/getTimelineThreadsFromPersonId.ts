import { gql } from '@apollo/client';

export const getTimelineThreadsFromPersonId = gql`
  query GetTimelineThreadsFromPersonId($personId: String!) {
    getTimelineThreadsFromPersonId(personId: $personId) {
      id
      read
      firstParticipant {
        personId
        workspaceMemberId
        firstName
        lastName
        avatarUrl
        handle
      }
      lastTwoParticipants {
        personId
        workspaceMemberId
        firstName
        lastName
        avatarUrl
        handle
      }
      lastMessageReceivedAt
      lastMessageBody
      subject
      numberOfMessagesInThread
      participantCount
    }
  }
`;
