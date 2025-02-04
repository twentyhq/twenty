import { gql } from '@apollo/client';

export const CREATE_AGENT = gql`
  mutation CreateAgent($createInput: CreateAgentInput!) {
    createAgent(createInput: $createInput) {
      id
    }
  }
`;
