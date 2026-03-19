import { gql } from '@apollo/client';

export const DISCOVER_AI_MODELS = gql`
  mutation DiscoverAiModels {
    discoverAiModels
  }
`;
