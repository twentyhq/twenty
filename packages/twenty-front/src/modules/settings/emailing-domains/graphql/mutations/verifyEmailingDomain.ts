import { gql } from '@apollo/client';

export const VERIFY_EMAILING_DOMAIN = gql`
  mutation VerifyEmailingDomain($id: String!) {
    verifyEmailingDomain(id: $id) {
      id
      domain
      status
      verifiedAt
      clickTrackingEnabled
      clickTrackingHostname
      clickTrackingHostnameStatus
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
