import { gql } from '@apollo/client';

export const SET_ADMIN_DEFAULT_AI_MODEL = gql`
  mutation SetAdminDefaultAiModel($tier: AiModelTier!, $modelId: String!) {
    setAdminDefaultAiModel(tier: $tier, modelId: $modelId)
  }
`;
