import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_DATA_EXPORT = gql`
  mutation CreateWorkspaceDataExport($workspaceId: UUID!) {
    createWorkspaceDataExport(workspaceId: $workspaceId) {
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
