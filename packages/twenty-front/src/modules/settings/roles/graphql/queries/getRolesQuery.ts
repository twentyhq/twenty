import { AGENT_FRAGMENT } from '@/ai/graphql/fragments/agentFragment';
import { API_KEY_FOR_ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/apiKeyForRoleFragment';
import { FIELD_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/fieldPermissionFragment';
import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateFragment';
import { ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT } from '@/settings/roles/graphql/fragments/rowLevelPermissionPredicateGroupFragment';
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
  ${ROW_LEVEL_PERMISSION_PREDICATE_FRAGMENT}
  ${ROW_LEVEL_PERMISSION_PREDICATE_GROUP_FRAGMENT}
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
      rowLevelPermissionPredicates {
        ...RowLevelPermissionPredicateFragment
      }
      rowLevelPermissionPredicateGroups {
        ...RowLevelPermissionPredicateGroupFragment
      }
    }
  }
`;
