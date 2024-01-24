import { gql } from '@apollo/client';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId($companyId: String!) {
    getTimelineThreadsFromCompanyId(companyId: $companyId) {
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
      subject
      numberOfMessagesInThread
      participantCount
    }
  }
`;
