import { gql } from '@apollo/client';

export const SET_EMAILING_DOMAIN_CLICK_TRACKING = gql`
  mutation SetEmailingDomainClickTracking($id: String!, $isEnabled: Boolean!) {
    setEmailingDomainClickTracking(id: $id, isEnabled: $isEnabled) {
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
