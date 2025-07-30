import { gql } from '@apollo/client';

export const FIND_ONE_AGENT = gql`
  query FindOneAgent($id: UUID!) {
    findOneAgent(input: { id: $id }) {
      id
      name
      label
      description
      icon
      prompt
      modelId
      responseFormat
      roleId
      isCustom
    }
  }
`;
