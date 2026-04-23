import { gql } from '@apollo/client';

export const GET_AI_PROVIDERS = gql`
  query GetAiProviders {
    getAiProviders
  }
`;
