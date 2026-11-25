import { gql } from '@apollo/client';

export const RUN_AGENT = gql`
  mutation RunAgent($input: RunAgentInput!) {
    runAgent(input: $input) {
      threadId
      runId
      status
    }
  }
`;
