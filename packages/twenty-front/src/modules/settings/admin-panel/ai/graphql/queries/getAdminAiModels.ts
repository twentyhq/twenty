import { gql } from '@apollo/client';

export const GET_ADMIN_AI_MODELS = gql`
  query GetAdminAiModels {
    getAdminAiModels {
      autoEnableNewModels
      models {
        modelId
        label
        modelFamily
        inferenceProvider
        isAvailable
        isAdminEnabled
        deprecated
        isRecommended
      }
    }
  }
`;
