import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';

export const FIND_MANY_AGENTS = gql`
  ${AGENT_FRAGMENT}
  query FindManyAgents {
    findManyAgents {
      ...AgentFields
    }
  }
`;
