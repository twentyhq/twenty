import { gql } from '@apollo/client';

export const getTimelineMessagesFromPersonId = gql`
  query GetTimelineMessagesFromPersonId($personId: String!) {
    getTimelineMessagesFromPersonId(personId: $personId) {
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
