import { gql } from '@apollo/client';

export const GET_PRODUCT_PRICES = gql`
  query GetProductPrices($product: String!) {
    getProductPrices(product: $product) {
      productPrices {
        created
        recurringInterval
        stripePriceId
        unitAmount
      }
    }
  }
`;
