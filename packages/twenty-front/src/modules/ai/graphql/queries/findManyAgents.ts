import { gql } from '@apollo/client';

export const FIND_MANY_AGENTS = gql`
  query FindManyAgents {
    findManyAgents {
      id
      name
      label
      icon
      description
      prompt
      modelId
      responseFormat
      roleId
      isCustom
      createdAt
      updatedAt
    }
  }
`;
