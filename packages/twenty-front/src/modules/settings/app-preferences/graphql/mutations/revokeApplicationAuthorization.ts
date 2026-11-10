import { gql } from '@apollo/client';

export const REVOKE_APPLICATION_AUTHORIZATION = gql`
  mutation RevokeApplicationAuthorization($applicationAuthorizationId: UUID!) {
    revokeApplicationAuthorization(
      applicationAuthorizationId: $applicationAuthorizationId
    )
  }
`;
