import { gql } from '@apollo/client';

export const GET_MODELS_DEV_SUGGESTIONS = gql`
  query GetModelsDevSuggestions($providerType: String!) {
    getModelsDevSuggestions(providerType: $providerType) {
      modelId
      name
      inputCostPerMillionTokens
      outputCostPerMillionTokens
      cachedInputCostPerMillionTokens
      cacheCreationCostPerMillionTokens
      contextWindowTokens
      maxOutputTokens
      modalities
      supportsReasoning
    }
  }
`;
