import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';
import { API_KEY_FOR_ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/apiKeyForRoleFragment';
import { FIELD_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/fieldPermissionFragment';
import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { PARTIAL_WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/partialWorkspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  ${PARTIAL_WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${AGENT_FRAGMENT}
  ${API_KEY_FOR_ROLE_FRAGMENT}
  ${PERMISSION_FLAG_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  ${FIELD_PERMISSION_FRAGMENT}
  query GetRoles {
    getRoles {
      ...RoleFragment
      workspaceMembers {
        ...PartialWorkspaceMemberQueryFragment
      }
      agents {
        ...AgentFields
      }
      apiKeys {
        ...ApiKeyForRoleFragment
      }
      permissionFlags {
        ...PermissionFlagFragment
      }
      objectPermissions {
        ...ObjectPermissionFragment
      }
      fieldPermissions {
        ...FieldPermissionFragment
      }
    }
  }
`;
