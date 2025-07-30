import { gql } from '@apollo/client';

export const CREATE_ONE_AGENT = gql`
  mutation CreateOneAgent($input: CreateAgentInput!) {
    createOneAgent(input: $input) {
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
