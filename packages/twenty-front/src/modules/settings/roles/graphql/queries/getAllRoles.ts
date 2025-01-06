import { gql } from '@apollo/client';

export const GET_ALL_ROLES = gql`
  query GetAllRoles($workspaceId: ID!) {
    findAllRoles(workspaceId: $workspaceId) {
      id
      name
      description
      canAccessWorkspaceSettings
      reportsTo {
        id
      }
      icon
      isCustom
      isActive
      workspace {
        id
        displayName
      }
      users {
        id
      }
      permissions {
        id
        tableName
        canCreate
        canEdit
        canView
        canDelete
      }
      createdAt
      updatedAt
    }
  }
`;
