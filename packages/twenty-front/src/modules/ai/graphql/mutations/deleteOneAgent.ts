import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/modules/ai/graphql/fragments/agentFragment';

export const DELETE_ONE_AGENT = gql`
  ${AGENT_FRAGMENT}
  mutation DeleteOneAgent($input: AgentIdInput!) {
    deleteOneAgent(input: $input) {
      ...AgentFields
    }
  }
`;
