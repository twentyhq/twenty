/* eslint-disable no-console, lingui/no-unlocalized-strings */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

// Inline the full GetRoles query with all fragments so we don't need
// @apollo/client at generation time.
const GET_ROLES_QUERY = `
  query GetRoles {
    getRoles {
      __typename
      id
      label
      description
      icon
      canUpdateAllSettings
      canAccessAllTools
      isEditable
      canReadAllObjectRecords
      canUpdateAllObjectRecords
      canSoftDeleteAllObjectRecords
      canDestroyAllObjectRecords
      canBeAssignedToUsers
      canBeAssignedToAgents
      canBeAssignedToApiKeys
      workspaceMembers {
        __typename
        id
        name {
          __typename
          firstName
          lastName
        }
        avatarUrl
        userEmail
      }
      agents {
        __typename
        id
        name
        label
        description
        icon
        prompt
        modelId
        responseFormat
        roleId
        isCustom
        modelConfiguration
        evaluationInputs
        applicationId
        createdAt
        updatedAt
      }
      apiKeys {
        __typename
        id
        name
        expiresAt
        revokedAt
      }
      permissionFlags {
        __typename
        id
        flag
        roleId
      }
      objectPermissions {
        __typename
        objectMetadataId
        canReadObjectRecords
        canUpdateObjectRecords
        canSoftDeleteObjectRecords
        canDestroyObjectRecords
        restrictedFields
        rowLevelPermissionPredicates {
          __typename
          id
          fieldMetadataId
          objectMetadataId
          operand
          subFieldName
          workspaceMemberFieldMetadataId
          workspaceMemberSubFieldName
          rowLevelPermissionPredicateGroupId
          positionInRowLevelPermissionPredicateGroup
          roleId
          value
        }
        rowLevelPermissionPredicateGroups {
          __typename
          id
          parentRowLevelPermissionPredicateGroupId
          logicalOperator
          positionInRowLevelPermissionPredicateGroup
          roleId
          objectMetadataId
        }
      }
      fieldPermissions {
        __typename
        objectMetadataId
        fieldMetadataId
        canReadFieldValue
        canUpdateFieldValue
        id
        roleId
      }
      rowLevelPermissionPredicates {
        __typename
        id
        fieldMetadataId
        objectMetadataId
        operand
        subFieldName
        workspaceMemberFieldMetadataId
        workspaceMemberSubFieldName
        rowLevelPermissionPredicateGroupId
        positionInRowLevelPermissionPredicateGroup
        roleId
        value
      }
      rowLevelPermissionPredicateGroups {
        __typename
        id
        parentRowLevelPermissionPredicateGroupId
        logicalOperator
        positionInRowLevelPermissionPredicateGroup
        roleId
        objectMetadataId
      }
    }
  }
`;

export const generateRoles = async (token: string) => {
  console.log('Fetching roles from /metadata ...');

  const data = (await graphqlRequest('/metadata', GET_ROLES_QUERY, token)) as {
    getRoles: Record<string, unknown>[];
  };

  console.log(`  Got ${data.getRoles.length} roles.`);

  writeGeneratedFile(
    'metadata/roles/mock-roles-data.ts',
    'mockedRoles',
    'Role[]',
    "import { type Role } from '~/generated-metadata/graphql';",
    data.getRoles,
  );
};
