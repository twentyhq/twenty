import { gql } from '@apollo/client';

export const SET_EMAILING_DOMAIN_TRACKING = gql`
  mutation SetEmailingDomainTracking(
    $id: String!
    $isClickTrackingEnabled: Boolean
    $isOpenTrackingEnabled: Boolean
  ) {
    setEmailingDomainTracking(
      id: $id
      isClickTrackingEnabled: $isClickTrackingEnabled
      isOpenTrackingEnabled: $isOpenTrackingEnabled
    ) {
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
