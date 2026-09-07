import { gql } from '@apollo/client';

export const GET_CUSTOM_AI_PROVIDER_ACCESS = gql`
  query GetCustomAiProviderAccess {
    getCustomAiProviderAccess {
      hasAccess
      seatCount
      seatThreshold
    }
  }
`;
