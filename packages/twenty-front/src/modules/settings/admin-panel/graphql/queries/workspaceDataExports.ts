import { gql } from '@apollo/client';

export const WORKSPACE_DATA_EXPORTS = gql`
  query WorkspaceDataExports($workspaceId: UUID!) {
    workspaceDataExports(workspaceId: $workspaceId) {
      id
      workspaceId
      status
      sizeInBytes
      createdAt
      objectCount
      exportedObjectCount
      columnCount
      exportedRowCount
      downloadUrl
    }
  }
`;
