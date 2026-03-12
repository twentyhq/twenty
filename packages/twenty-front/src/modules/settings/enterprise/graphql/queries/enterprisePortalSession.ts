import { gql } from '@apollo/client';

export const ENTERPRISE_PORTAL_SESSION = gql`
  query EnterprisePortalSession($returnUrlPath: String) {
    enterprisePortalSession(returnUrlPath: $returnUrlPath)
  }
`;
