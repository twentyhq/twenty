import gql from 'graphql-tag';

export const TEST_MCP_SERVER_TOOL = gql`
  mutation TestMcpServerTool($input: TestMcpServerToolInput!) {
    testMcpServerTool(input: $input) {
      success
      result
      error
    }
  }
`;
