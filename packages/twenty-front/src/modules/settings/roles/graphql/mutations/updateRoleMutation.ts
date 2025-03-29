import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { gql } from '@apollo/client';

export const UPDATE_ROLE = gql`
  ${ROLE_FRAGMENT}
  mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
    updateOneRole(updateRoleInput: $updateRoleInput) {
      ...RoleFragment
    }
  }
`;
