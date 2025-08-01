import { gql } from '@apollo/client';

export const DELETE_ROLE = gql`
  mutation DeleteOneRole($roleId: UUID!) {
    deleteOneRole(roleId: $roleId)
  }
`;
