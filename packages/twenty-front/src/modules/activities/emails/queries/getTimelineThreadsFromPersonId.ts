import { gql } from '@apollo/client';

export const getTimelineThreadsFromPersonId = gql`
  query GetTimelineThreadsFromPersonId($personId: String!) {
    getTimelineThreadsFromPersonId(personId: $personId) {
      body
      numberOfMessagesInThread
      read
      receivedAt
      senderName
      senderPictureUrl
      subject
    }
  }
`;
