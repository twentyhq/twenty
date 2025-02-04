import { gql } from '@apollo/client';

export const TOGGLE_AGENT_STATUS = gql`
  mutation ToggleAgentStatus($agentId: String!) {
    toggleAgentStatus(agentId: $agentId)
  }
`;
