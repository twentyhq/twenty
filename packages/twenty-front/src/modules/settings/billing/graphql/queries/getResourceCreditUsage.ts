import { gql } from '@apollo/client';

export const GET_RESOURCE_CREDIT_USAGE = gql`
  query GetResourceCreditUsage {
    getResourceCreditUsage {
      productKey
      workspaceCreditsUsed
      workspaceCreditsGranted
      workspaceCreditsGrantedForSeats
      workspaceCreditsSeats
      workspaceCreditsExtraGranted
      workspaceCreditsTotalGranted
      unitPriceCents
    }
  }
`;
