import { gql } from '@apollo/client';

export const SET_ADMIN_AI_MODEL_ENABLED = gql`
  mutation SetAdminAiModelEnabled($modelId: String!, $enabled: Boolean!) {
    setAdminAiModelEnabled(modelId: $modelId, enabled: $enabled)
  }
`;
