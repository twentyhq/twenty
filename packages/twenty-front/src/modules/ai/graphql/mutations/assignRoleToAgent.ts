import { gql } from '@apollo/client';

export const ASSIGN_ROLE_TO_AGENT = gql`
  mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
    assignRoleToAgent(agentId: $agentId, roleId: $roleId)
  }
`;
