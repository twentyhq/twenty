import { gql } from '@apollo/client';

export const REMOVE_AI_PROVIDER = gql`
  mutation RemoveAiProvider($providerName: String!) {
    removeAiProvider(providerName: $providerName)
  }
`;
