import { gql } from '@apollo/client';

export const UPDATE_ONE_AGENT = gql`
  mutation UpdateOneAgent($input: UpdateAgentInput!) {
    updateOneAgent(input: $input) {
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
