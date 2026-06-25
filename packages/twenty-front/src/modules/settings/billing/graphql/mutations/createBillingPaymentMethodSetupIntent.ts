import { gql } from '@apollo/client';

export const CREATE_BILLING_PAYMENT_METHOD_SETUP_INTENT = gql`
  mutation CreateBillingPaymentMethodSetupIntent {
    createBillingPaymentMethodSetupIntent {
      clientSecret
    }
  }
`;
