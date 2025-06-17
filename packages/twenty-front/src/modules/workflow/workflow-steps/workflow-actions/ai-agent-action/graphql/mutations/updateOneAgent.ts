import { gql } from '@apollo/client';

export const UPDATE_ONE_AGENT = gql`
  mutation UpdateAgent($input: UpdateAgentInput!) {
    updateOneAgent(input: $input) {
      id
      name
      description
      prompt
      model
      responseFormat
    }
  }
`;
