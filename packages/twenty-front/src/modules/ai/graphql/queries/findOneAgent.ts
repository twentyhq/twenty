import { gql } from '@apollo/client';
import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';

export const FIND_ONE_AGENT = gql`
  ${AGENT_FRAGMENT}
  query FindOneAgent($id: UUID!) {
    findOneAgent(input: { id: $id }) {
      ...AgentFields
    }
  }
`;
