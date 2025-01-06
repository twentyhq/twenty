import { gql } from '@apollo/client';

export const GET_ONE_ROLE = gql`
  query FindOneRole($roleId: ID!) {
    findOneRole(roleId: $roleId) {
      id
      icon
      name
      description
      isActive
    }
  }
`;
