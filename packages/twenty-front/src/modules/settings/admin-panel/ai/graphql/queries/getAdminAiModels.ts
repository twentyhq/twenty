import { gql } from '@apollo/client';

export const GET_ADMIN_AI_MODELS = gql`
  query GetAdminAiModels {
    getAdminAiModels {
      defaultSmartModelId
      defaultFastModelId
      models {
        modelId
        label
        modelFamily
        provider
        isAvailable
        isAdminEnabled
        deprecated
        isRecommended
        contextWindowTokens
        maxOutputTokens
        inputCostPerMillionTokens
        outputCostPerMillionTokens
        providerName
        dataResidency
      }
    }
  }
`;
