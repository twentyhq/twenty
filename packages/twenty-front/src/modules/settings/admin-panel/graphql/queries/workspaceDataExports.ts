import { gql } from '@apollo/client';

export const WORKSPACE_DATA_EXPORTS = gql`
  query WorkspaceDataExports($workspaceId: UUID!) {
    workspaceDataExports(workspaceId: $workspaceId) {
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
