import { gql } from '@apollo/client';

export const GET_TOOL_INDEX = gql`
  query GetToolIndex {
    getToolIndex {
      name
      description
      category
      objectName
      inputSchema
    }
  }
`;
