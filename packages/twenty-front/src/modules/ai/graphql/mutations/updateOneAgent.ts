import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '../fragments/agentFragment';

export const UPDATE_ONE_AGENT = gql`
  ${AGENT_FRAGMENT}
  mutation UpdateOneAgent($input: UpdateAgentInput!) {
    updateOneAgent(input: $input) {
      ...AgentFields
    }
  }
`;
