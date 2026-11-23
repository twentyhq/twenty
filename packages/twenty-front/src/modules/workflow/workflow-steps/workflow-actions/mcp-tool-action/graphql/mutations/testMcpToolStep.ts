import { gql } from '@apollo/client';

export const TEST_MCP_TOOL_STEP = gql`
  mutation TestMcpToolStep($input: TestMcpToolStepInput!) {
    testMcpToolStep(input: $input) {
      success
      result
      error
    }
  }
`;
