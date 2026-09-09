import { gql } from '@apollo/client';

export const SET_EMAILING_DOMAIN_TRACKING = gql`
  mutation SetEmailingDomainTracking(
    $id: String!
    $isClickTrackingEnabled: Boolean!
  ) {
    setEmailingDomainTracking(
      id: $id
      isClickTrackingEnabled: $isClickTrackingEnabled
    ) {
      id
      domain
      status
      verifiedAt
      isClickTrackingEnabled
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
