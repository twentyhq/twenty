import { gql } from '@apollo/client';

export const getTimelineMessagesFromCompanyId = gql`
  query GetTimelineMessagesFromCompanyId($companyId: String!) {
    getTimelineMessagesFromCompanyId(companyId: $companyId) {
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
