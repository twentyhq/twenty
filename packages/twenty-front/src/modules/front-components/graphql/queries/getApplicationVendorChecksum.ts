import gql from 'graphql-tag';

export const GET_APPLICATION_VENDOR_CHECKSUM = gql`
  query GetApplicationVendorChecksum($applicationId: UUID!) {
    applicationVendorChecksum(applicationId: $applicationId)
  }
`;
