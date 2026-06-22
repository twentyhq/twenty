import { gql } from '@apollo/client';

export const GET_TOOL_INDEX = gql`
  query GetToolIndex {
    getToolIndex {
      name
      label
      inProgressLabel
      completedLabel
      description
      category
      objectName
      icon
    }
  }
`;
