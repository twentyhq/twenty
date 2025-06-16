import { gql } from '@apollo/client';

export const FIND_ONE_AGENT = gql`
  query GetAgent($id: ID!) {
    findOneAgent(input: { id: $id }) {
      id
      name
      description
      prompt
      model
      responseFormat
    }
  }
`;
