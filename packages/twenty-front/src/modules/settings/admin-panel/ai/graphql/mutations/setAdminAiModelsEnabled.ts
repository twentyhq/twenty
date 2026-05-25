import { gql } from '@apollo/client';

export const SET_ADMIN_AI_MODELS_ENABLED = gql`
  mutation SetAdminAiModelsEnabled($modelIds: [String!]!, $enabled: Boolean!) {
    setAdminAiModelsEnabled(modelIds: $modelIds, enabled: $enabled)
  }
`;
