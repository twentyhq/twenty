import { gql } from '@apollo/client';

export const GET_ALL_EMAILING_DOMAINS = gql`
  query GetEmailingDomains {
    getEmailingDomains {
      id
      domain
      status
      verifiedAt
      isClickTrackingEnabled
      isOpenTrackingEnabled
      trackingHostname
      trackingHostnameStatus
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
