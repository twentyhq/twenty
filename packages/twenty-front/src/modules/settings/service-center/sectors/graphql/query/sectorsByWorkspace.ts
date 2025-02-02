import { gql } from '@apollo/client';

export const GET_ALL_SECTORS = gql`
  query SectorsByWorkspace($workspaceId: String!) {
    sectorsByWorkspace(workspaceId: $workspaceId) {
      id
      name
      icon
      topics
      workspace {
        id
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;
