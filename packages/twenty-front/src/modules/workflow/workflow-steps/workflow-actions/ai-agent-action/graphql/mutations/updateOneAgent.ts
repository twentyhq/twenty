import { gql } from '@apollo/client';

export const UPDATE_ONE_AGENT = gql`
  mutation UpdateOneAgent($input: UpdateAgentInput!) {
    updateOneAgent(input: $input) {
      id
      name
      description
      prompt
      modelId
      responseFormat
    }
  }
`;
