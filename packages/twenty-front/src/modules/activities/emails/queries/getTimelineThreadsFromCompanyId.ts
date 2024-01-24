import { gql } from '@apollo/client';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId($companyId: String!) {
    getTimelineThreadsFromCompanyId(companyId: $companyId) {
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
