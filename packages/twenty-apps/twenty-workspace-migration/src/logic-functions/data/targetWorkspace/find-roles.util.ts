import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
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
    }
    rowLevelPermissionPredicateGroups {
      id
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
