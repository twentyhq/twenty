import { gql } from '@apollo/client';

export const FIND_AGENT_HANDOFF_TARGETS = gql`
  query FindAgentHandoffTargets($input: AgentIdInput!) {
    findAgentHandoffTargets(input: $input) {
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
`;
