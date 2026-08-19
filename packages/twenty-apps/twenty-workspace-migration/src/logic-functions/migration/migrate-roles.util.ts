import type { AxiosInstance } from "axios";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import {
  upsertFieldPermissions,
  upsertObjectPermissions,
  upsertPermissionFlags
} from "src/logic-functions/requests/upsert-role-permissions.util";
import { Role } from "src/logic-functions/types/role.type";
import { logger } from "src/logic-functions/utils/logger.util";

export const migrateRoles = async (
  targetWorkspace: AxiosInstance,
  sourceRoles: Role[],
  targetRoles: Role[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const targetRoleIdByLabel = new Map(targetRoles.map((role) => [role.label, role.id]));

  let createdCount = 0;

  for (const role of sourceRoles) {
    if (targetRoleIdByLabel.has(role.label)) {
      continue;
    }

    if (role.rowLevelPermissionPredicates.length > 0 || role.rowLevelPermissionPredicateGroups.length > 0) {
      logger.warn(`Role "${role.label}": has row-level permission predicates, which this tool doesn't migrate - review manually`);
    }

    const created = await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createOneRole', 'createRoleInput', 'CreateRoleInput', {
      label: role.label,
      description: role.description,
      icon: role.icon,
      canUpdateAllSettings: role.canUpdateAllSettings,
      canAccessAllTools: role.canAccessAllTools,
      canReadAllObjectRecords: role.canReadAllObjectRecords,
      canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
      canBeAssignedToUsers: role.canBeAssignedToUsers,
      canBeAssignedToAgents: role.canBeAssignedToAgents,
      canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
    }));
    const targetRoleId = created.id;
    createdCount += 1;

    if (role.permissionFlags.length > 0) {
      await executeWithRetryAndCheckpoint(() =>
        upsertPermissionFlags(targetWorkspace, targetRoleId, role.permissionFlags.map((flag) => flag.flag)),
      );
    }

    const objectPermissions = role.objectPermissions.flatMap((permission) => {
      const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(permission.objectMetadataId);
      if (targetObjectMetadataId === undefined) {
        logger.warn(`Role "${role.label}": skipping object permission - target object not found for object ${permission.objectMetadataId}`);
        return [];
      }
      return [{
        objectMetadataId: targetObjectMetadataId,
        canReadObjectRecords: permission.canReadObjectRecords,
        canUpdateObjectRecords: permission.canUpdateObjectRecords,
        canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
        canDestroyObjectRecords: permission.canDestroyObjectRecords,
      }];
    });
    if (objectPermissions.length > 0) {
      await executeWithRetryAndCheckpoint(() => upsertObjectPermissions(targetWorkspace, targetRoleId, objectPermissions));
    }

    const fieldPermissions = role.fieldPermissions.flatMap((permission) => {
      const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(permission.objectMetadataId);
      const targetFieldMetadataId = targetFieldIdBySourceFieldId.get(permission.fieldMetadataId);
      if (targetObjectMetadataId === undefined || targetFieldMetadataId === undefined) {
        logger.warn(`Role "${role.label}": skipping field permission - target field not found for field ${permission.fieldMetadataId}`);
        return [];
      }
      return [{
        objectMetadataId: targetObjectMetadataId,
        fieldMetadataId: targetFieldMetadataId,
        canReadFieldValue: permission.canReadFieldValue,
        canUpdateFieldValue: permission.canUpdateFieldValue,
      }];
    });
    if (fieldPermissions.length > 0) {
      await executeWithRetryAndCheckpoint(() => upsertFieldPermissions(targetWorkspace, targetRoleId, fieldPermissions));
    }
  }

  logger.log(`Roles: created ${createdCount}`);
};