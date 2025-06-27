import { gql } from '@apollo/client';

export const CREATE_AGENT = gql`
  mutation CreateAgent($createInput: CreateWorkspaceAgentInput!) {
    createAgent(createInput: $createInput) {
      id
    }
  }
`;
