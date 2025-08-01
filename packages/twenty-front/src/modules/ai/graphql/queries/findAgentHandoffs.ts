import { gql } from '@apollo/client';

export const FIND_AGENT_HANDOFFS = gql`
  query FindAgentHandoffs($input: AgentIdInput!) {
    findAgentHandoffs(input: $input) {
      id
      description
      toAgent {
        id
        name
        label
        description
        icon
        modelId
        prompt
        isCustom
        createdAt
        updatedAt
      }
    }
  }
`;
