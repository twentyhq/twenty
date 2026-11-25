import { gql } from '@apollo/client';

export const SET_BILLING_PARTNER_CODE = gql`
  mutation SetBillingPartnerCode($partnerCode: String!) {
    setBillingPartnerCode(partnerCode: $partnerCode) {
      partnerCode
      isEditable
    }
  }
`;
