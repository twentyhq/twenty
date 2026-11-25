import { gql } from '@apollo/client';

export const BILLING_PARTNER_CODE = gql`
  query BillingPartnerCode {
    billingPartnerCode {
      partnerCode
      isEditable
    }
  }
`;
