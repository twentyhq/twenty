import { gql } from '@apollo/client';

export const DELETE_ROLE = gql`
  mutation DeleteOneRole($roleId: String!) {
    deleteOneRole(roleId: $roleId)
  }
`;
