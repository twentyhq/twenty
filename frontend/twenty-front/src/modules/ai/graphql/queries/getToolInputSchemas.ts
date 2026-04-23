import { gql } from '@apollo/client';

export const GET_TOOL_INPUT_SCHEMA = gql`
  query GetToolInputSchema($toolName: String!) {
    getToolInputSchema(toolName: $toolName)
  }
`;
