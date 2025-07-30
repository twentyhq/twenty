import { gql } from '@apollo/client';

export const DELETE_ONE_AGENT = gql`
  mutation DeleteOneAgent($input: AgentIdInput!) {
    deleteOneAgent(input: $input) {
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
