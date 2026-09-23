import { gql } from '@apollo/client';

export const GET_PERMISSION_FLAGS = gql`
  query GetPermissionFlags {
    getPermissionFlags {
      id
      applicationId
      key
      label
      description
      icon
      permissionType
    }
  }
`;
