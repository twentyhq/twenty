import { gql } from '@apollo/client';

export const ENTERPRISE_CHECKOUT_SESSION = gql`
  query EnterpriseCheckoutSession {
    enterpriseCheckoutSession
  }
`;
