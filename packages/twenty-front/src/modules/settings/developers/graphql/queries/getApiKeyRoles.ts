import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import gql from 'graphql-tag';

export const GET_API_KEY_ROLES = gql`
  query GetApiKeyRoles {
    getApiKeyRoles {
      ...RoleFragment
    }
  }
  ${ROLE_FRAGMENT}
`;
