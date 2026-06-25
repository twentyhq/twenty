import { gql } from '@apollo/client';

export const SET_ADMIN_AI_MODEL_RECOMMENDED = gql`
  mutation SetAdminAiModelRecommended(
    $modelId: String!
    $recommended: Boolean!
  ) {
    setAdminAiModelRecommended(modelId: $modelId, recommended: $recommended)
  }
`;
