import { gql } from '@apollo/client';

export const getTimelineThreadsFromPersonId = gql`
  query GetTimelineThreadsFromPersonId($personId: String!) {
    getTimelineThreadsFromPersonId(personId: $personId) {
      read
      firstParticipant {
        id
        handle
      }
      lastTwoParticipants {
        id
        handle
      }
      lastMessageReceivedAt
      lastMessageBody
      lastMessageSubject
      numberOfMessagesInThread
      participantCount
    }
  }
`;
