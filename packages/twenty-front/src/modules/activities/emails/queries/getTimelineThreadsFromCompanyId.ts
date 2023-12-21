import { gql } from '@apollo/client';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId($companyId: String!) {
    getTimelineThreadsFromCompanyId(companyId: $companyId) {
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
