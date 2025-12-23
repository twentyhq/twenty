import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/modules/ai/graphql/fragments/agentFragment';

export const CREATE_ONE_AGENT = gql`
  ${AGENT_FRAGMENT}
  mutation CreateOneAgent($input: CreateAgentInput!) {
    createOneAgent(input: $input) {
      ...AgentFields
    }
  }
`;
