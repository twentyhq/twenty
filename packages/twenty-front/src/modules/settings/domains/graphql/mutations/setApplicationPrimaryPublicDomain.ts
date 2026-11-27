import { gql } from '@apollo/client';

export const SET_APPLICATION_PRIMARY_PUBLIC_DOMAIN = gql`
  mutation SetApplicationPrimaryPublicDomain(
    $applicationId: String!
    $publicDomainId: String!
  ) {
    setApplicationPrimaryPublicDomain(
      applicationId: $applicationId
      publicDomainId: $publicDomainId
    ) {
      id
      domain
    }
  }
`;
