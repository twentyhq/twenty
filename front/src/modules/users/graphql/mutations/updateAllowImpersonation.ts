import { gql } from '@apollo/client';

export const UPDATE_ALLOW_IMPERSONATION = gql`
  mutation UpdateAllowImpersonation($allowImpersonation: Boolean!) {
    allowImpersonation(allowImpersonation: $allowImpersonation) {
      id
      allowImpersonation
    }
  }
`;
