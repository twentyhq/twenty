import { gql } from '@apollo/client';

export const RELEASE_ENTERPRISE_SERVER_BINDING = gql`
  mutation ReleaseEnterpriseServerBinding {
    releaseEnterpriseServerBinding {
      isValid
      licensee
      expiresAt
      subscriptionId
    }
  }
`;
