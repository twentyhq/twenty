import { gql } from '@apollo/client';

export const SET_ADMIN_DEFAULT_AI_MODEL = gql`
  mutation SetAdminDefaultAiModel($role: AiModelRole!, $modelId: String!) {
    setAdminDefaultAiModel(role: $role, modelId: $modelId)
  }
`;
