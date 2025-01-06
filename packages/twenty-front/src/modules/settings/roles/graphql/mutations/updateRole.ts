import { gql } from '@apollo/client';

export const UPDATE_ROLE = gql`
  mutation UpdateRole($updateRoleId: ID!, $updateRoleInput: UpdateRoleInput!) {
    updateRole(id: $updateRoleId, updateRoleInput: $updateRoleInput) {
      id
      name
      description
      canAccessWorkspaceSettings
      icon
      permissions {
        id
        tableName
        canCreate
        canEdit
        canView
        canDelete
      }
      reportsTo {
        id
        name
      }
      workspace {
        id
        displayName
      }
      isActive
    }
  }
`;

export const TOOGLE_ROLE_ACTIVE = gql`
  mutation ToggleRoleStatus($roleId: ID!) {
    toggleRoleStatus(roleId: $roleId) {
      id
      isActive
    }
  }
`;
