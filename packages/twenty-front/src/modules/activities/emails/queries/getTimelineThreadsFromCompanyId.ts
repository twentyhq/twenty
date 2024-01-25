import { gql } from '@apollo/client';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId(
    $companyId: ID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromCompanyId(
      companyId: $companyId
      page: $page
      pageSize: $pageSize
    ) {
      id
      read
      firstParticipant {
        personId
        workspaceMemberId
        firstName
        lastName
        displayName
        avatarUrl
        handle
      }
      lastTwoParticipants {
        personId
        workspaceMemberId
        firstName
        lastName
        displayName
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
