import { gql } from '@apollo/client';

export const REMOVE_ROLE_FROM_AGENT = gql`
  mutation RemoveRoleFromAgent($agentId: UUID!) {
    removeRoleFromAgent(agentId: $agentId)
  }
`;
