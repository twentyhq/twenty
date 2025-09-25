import { gql } from '@apollo/client';

export const GET_ALL_EMAILING_DOMAINS = gql`
  query GetEmailingDomains {
    getEmailingDomains {
      id
      domain
      driver
      status
      verifiedAt
      verificationRecords {
        type
        key
        value
        priority
      }
      createdAt
      updatedAt
    }
  }
`;
