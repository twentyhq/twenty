import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_SCHEMA = gql`
  mutation CreateWorkspaceSchema($input: CreateWorkspaceSchemaInput!) {
    createWorkspaceSchema(data: $input) {
      id
    }
  }
`;
