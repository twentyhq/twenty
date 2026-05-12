import { gql } from '@apollo/client';

export const SET_ADMIN_AI_MODELS_RECOMMENDED = gql`
  mutation SetAdminAiModelsRecommended(
    $modelIds: [String!]!
    $recommended: Boolean!
  ) {
    setAdminAiModelsRecommended(modelIds: $modelIds, recommended: $recommended)
  }
`;
