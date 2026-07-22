import { gql } from '@apollo/client';

export const GET_ALL_EMAILING_DOMAINS = gql`
  query GetEmailingDomains {
    getEmailingDomains {
      id
      domain
      status
      verifiedAt
      senderDisplayName
      verificationRecords {
        type
        key
        value
        priority
        status
      }
      createdAt
      updatedAt
    }
  }
`;
