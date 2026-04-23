import { gql } from '@apollo/client';

export const ADD_AI_PROVIDER = gql`
  mutation AddAiProvider($providerName: String!, $providerConfig: JSON!) {
    addAiProvider(providerName: $providerName, providerConfig: $providerConfig)
  }
`;
