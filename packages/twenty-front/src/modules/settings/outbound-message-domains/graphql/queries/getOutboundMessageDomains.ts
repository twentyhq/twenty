import { gql } from '@apollo/client';

export const GET_ALL_OUTBOUND_MESSAGE_DOMAINS = gql`
  query GetOutboundMessageDomains {
    getOutboundMessageDomains {
      id
      domain
      driver
      status
      verifiedAt
      verificationRecords {
        type
        name
        value
        priority
      }
      createdAt
      updatedAt
    }
  }
`;
