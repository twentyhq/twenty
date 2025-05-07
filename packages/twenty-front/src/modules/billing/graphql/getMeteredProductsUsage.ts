import { gql } from '@apollo/client';

export const GET_METERED_PRODUCTS_USAGE = gql`
  query GetMeteredProductsUsage {
    getMeteredProductsUsage {
      productKey
      usageQuantity
      freeTierQuantity
      freeTrialQuantity
      unitPriceCents
      totalCostCents
    }
  }
`;
