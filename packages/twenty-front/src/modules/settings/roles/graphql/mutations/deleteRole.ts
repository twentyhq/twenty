import { gql } from '@apollo/client';

export const DELETE_ROLE_BY_ID = gql`
  mutation DeleteRole($roleId: ID!) {
    deleteRole(roleId: $roleId) {
      id
    }
  }
`;
