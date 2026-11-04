import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_DATA_EXPORT = gql`
  mutation CreateWorkspaceDataExport($workspaceId: UUID!) {
    createWorkspaceDataExport(workspaceId: $workspaceId) {
      id
      workspaceId
      status
      sizeInBytes
      createdAt
      objects {
        nameSingular
        labelSingular
        fieldCount
        recordCount
        isExported
      }
      downloadUrl
    }
  }
`;
