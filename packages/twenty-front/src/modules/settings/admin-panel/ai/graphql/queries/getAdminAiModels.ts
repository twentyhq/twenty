import { gql } from '@apollo/client';

export const GET_ADMIN_AI_MODELS = gql`
  query GetAdminAiModels {
    getAdminAiModels {
      defaultModelByTier {
        tier
        modelId
      }
      models {
        modelId
        label
        modelFamily
        sdkPackage
        isAvailable
        isAdminEnabled
        isDeprecated
        contextWindowTokens
        maxOutputTokens
        inputCostPerMillionTokens
        outputCostPerMillionTokens
        providerName
        providerLabel
        name
        dataResidency
        efforts
      }
    }
  }
`;
