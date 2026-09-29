import { gql } from '@apollo/client';

export const RESOLVE_TOOL_CALL = gql`
  mutation ResolveToolCall($input: ResolveToolCallInput!) {
    resolveToolCall(input: $input) {
      streamId
    }
  }
`;
