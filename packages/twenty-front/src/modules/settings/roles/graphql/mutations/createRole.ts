import { gql } from '@apollo/client';

export const CREATE_ROLE = gql`
  mutation CreateRole($createRoleInput: CreateRoleInput!) {
    createRole(createRoleInput: $createRoleInput) {
      id
      name
      description
      canAccessWorkspaceSettings
      createdAt
      updatedAt
      reportsTo {
        id
        name
      }
      permissions {
        id
        canCreate
        canDelete
        canEdit
        canView
        tableName
      }
      workspace {
        id
      }
    }
  }
`;
