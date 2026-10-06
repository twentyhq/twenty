import { gql } from '@apollo/client';

export const GET_CREDIT_TOP_UP_OFFERS = gql`
  query GetCreditTopUpOffers {
    getCreditTopUpOffers {
      creditAmount
      amountCents
      currency
    }
  }
`;
