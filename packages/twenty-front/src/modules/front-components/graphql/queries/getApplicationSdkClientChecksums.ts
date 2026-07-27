import gql from 'graphql-tag';

export const GET_APPLICATION_SDK_CLIENT_CHECKSUMS = gql`
  query GetApplicationSdkClientChecksums($applicationId: UUID!) {
    applicationSdkClientChecksums(applicationId: $applicationId) {
      core
      metadata
    }
  }
`;
