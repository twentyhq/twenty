import { gql } from '@apollo/client';

export const RUN_EVALUATION_INPUT = gql`
  mutation RunEvaluationInput($agentId: UUID!, $input: String!) {
    runEvaluationInput(agentId: $agentId, input: $input) {
      id
      threadId
      agentId
      createdAt
      evaluations {
        id
        score
        comment
        createdAt
      }
    }
  }
`;
