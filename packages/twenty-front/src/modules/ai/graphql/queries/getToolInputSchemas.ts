import { gql } from '@apollo/client';

export const GET_TOOL_INPUT_SCHEMAS = gql`
  query GetToolInputSchemas {
    getToolIndex {
      name
      inputSchema
    }
  }
`;
