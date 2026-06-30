import { gql } from '@apollo/client';

export const GET_TOOL_INDEX = gql`
  query GetToolIndex {
    getToolIndex {
      name
      label
      description
      category
      objectName
      icon
    }
  }
`;
