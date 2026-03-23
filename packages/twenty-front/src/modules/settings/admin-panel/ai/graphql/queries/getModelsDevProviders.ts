import { gql } from '@apollo/client';

export const GET_MODELS_DEV_PROVIDERS = gql`
  query GetModelsDevProviders {
    getModelsDevProviders {
      id
      modelCount
      npm
    }
  }
`;
