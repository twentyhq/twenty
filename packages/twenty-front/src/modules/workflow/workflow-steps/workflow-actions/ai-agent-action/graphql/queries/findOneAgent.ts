import { gql } from '@apollo/client';

export const FIND_ONE_AGENT = gql`
  query FindOneAgent($id: UUID!) {
    findOneAgent(input: { id: $id }) {
      id
      name
      description
      prompt
      modelId
      responseFormat
      roleId
    }
  }
`;
