import { gql } from '@apollo/client';

export const ASSIGN_ROLE_TO_AGENT = gql`
  mutation AssignRoleToAgent($input: AssignRoleToAgentInput!) {
    assignRoleToAgent(input: $input)
  }
`;
