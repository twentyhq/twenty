import { gql } from '@apollo/client';

export const CALL_TOOL = gql`
  mutation CallTool($toolName: String!, $input: JSON) {
    callTool(toolName: $toolName, input: $input) {
      success
      message
      error
      result
    }
  }
`;
