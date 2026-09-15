import { gql } from '@apollo/client';

export const GET_RESOURCE_CREDIT_USAGE = gql`
  query GetResourceCreditUsage {
    getResourceCreditUsage {
      productKey
      usedCredits
      grantedCredits
      rolloverCredits
      totalGrantedCredits
      unitPriceCents
    }
  }
`;
