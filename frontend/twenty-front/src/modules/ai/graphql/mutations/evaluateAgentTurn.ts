import { gql } from '@apollo/client';

export const EVALUATE_AGENT_TURN = gql`
  mutation EvaluateAgentTurn($turnId: UUID!) {
    evaluateAgentTurn(turnId: $turnId) {
      id
      turnId
      score
      comment
      createdAt
    }
  }
`;
