import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { Role } from "src/logic-functions/types/role.type";

const QUERY = `query findRoles {
  getRoles {
    id
    label
    description
    icon
    canUpdateAllSettings
    canAccessAllTools
    canReadAllObjectRecords
    canUpdateAllObjectRecords
    canSoftDeleteAllObjectRecords
    canDestroyAllObjectRecords
    canBeAssignedToUsers
    canBeAssignedToAgents
    canBeAssignedToApiKeys
    permissionFlags {
      flag
    }
    objectPermissions {
      objectMetadataId
      canReadObjectRecords
      canUpdateObjectRecords
      canSoftDeleteObjectRecords
      canDestroyObjectRecords
    }
    fieldPermissions {
      objectMetadataId
      fieldMetadataId
      canReadFieldValue
      canUpdateFieldValue
    }
    rowLevelPermissionPredicates {
      id
      fieldMetadataId
      objectMetadataId
      operand
      value
      subFieldName
      workspaceMemberFieldMetadataId
      workspaceMemberSubFieldName
      rowLevelPermissionPredicateGroupId
      positionInRowLevelPermissionPredicateGroup
    }
    rowLevelPermissionPredicateGroups {
      id
      parentRowLevelPermissionPredicateGroupId
      logicalOperator
      positionInRowLevelPermissionPredicateGroup
      objectMetadataId
    }
  }
}`;

export const findRoles = async (client: AxiosInstance): Promise<Role[]> => {
  const data = await postGraphql<{ getRoles: Role[] }>(
    client,
    '/metadata',
    'findRoles',
    QUERY,
  );

  return data.getRoles;
}
