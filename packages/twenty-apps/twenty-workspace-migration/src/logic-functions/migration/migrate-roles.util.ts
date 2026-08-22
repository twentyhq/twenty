import type { AxiosInstance } from "axios";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import {
  upsertFieldPermissions,
  upsertObjectPermissions,
  upsertPermissionFlags,
  upsertRowLevelPermissionPredicates
} from "src/logic-functions/requests/upsert-role-permissions.util";
import { Role, RowLevelPermissionPredicateGroup } from "src/logic-functions/types/role.type";
import { logger } from "src/logic-functions/utils/logger.util";
import { executeWithRetry } from "src/logic-functions/utils/execute-with-retry.util";
import { setStateRef } from "src/logic-functions/utils/migration-state.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";
import { createParentChainQueue } from "src/logic-functions/utils/parent-chain-queue.util";

// A group can reference a parent group, so parents need to be created (or, here, ordered
// ahead) before their children - same problem as viewFilterGroups in migrate-views.util.ts.
// Unlike that one, this API takes the whole (role, object) set in a single call rather than
// one create per group, so it's enough to sort once rather than resolve incrementally.
const sortGroupsByParentChain = (
  groups: RowLevelPermissionPredicateGroup[],
  warningContext: string,
): RowLevelPermissionPredicateGroup[] => {
  const queue = createParentChainQueue(
    groups,
    (group) => group.id,
    (group) => group.parentRowLevelPermissionPredicateGroupId,
    new Set(),
  );
  const sorted: RowLevelPermissionPredicateGroup[] = [];

  while (queue.hasPending()) {
    for (const group of queue.drainWave()) {
      sorted.push(group);
      queue.enqueueChildrenOf(group);
    }
  }

  if (sorted.length < groups.length) {
    logger.warn(`Skipping ${groups.length - sorted.length} row-level permission predicate group(s) on ${warningContext}: unresolved parent chain`);
  }

  return sorted;
};

const migrateRowLevelPermissionPredicatesForRole = async (
  targetWorkspace: AxiosInstance,
  targetRoleId: string,
  role: Role,
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
): Promise<void> => {
  const groupsByObjectId = new Map<string, typeof role.rowLevelPermissionPredicateGroups>();
  for (const group of role.rowLevelPermissionPredicateGroups) {
    groupsByObjectId.set(group.objectMetadataId, [...(groupsByObjectId.get(group.objectMetadataId) ?? []), group]);
  }
  const predicatesByObjectId = new Map<string, typeof role.rowLevelPermissionPredicates>();
  for (const predicate of role.rowLevelPermissionPredicates) {
    predicatesByObjectId.set(predicate.objectMetadataId, [...(predicatesByObjectId.get(predicate.objectMetadataId) ?? []), predicate]);
  }

  const sourceObjectMetadataIds = new Set([...groupsByObjectId.keys(), ...predicatesByObjectId.keys()]);

  for (const sourceObjectMetadataId of sourceObjectMetadataIds) {
    const targetObjectMetadataId = targetObjectIdBySourceObjectId.get(sourceObjectMetadataId);
    if (targetObjectMetadataId === undefined) {
      logger.warn(`Role "${role.label}": skipping row-level permission predicates - target object not found for object ${sourceObjectMetadataId}`);
      continue;
    }

    const warningContext = `role "${role.label}"`;
    const sortedGroups = sortGroupsByParentChain(groupsByObjectId.get(sourceObjectMetadataId) ?? [], warningContext);
    const resolvedGroupIds = new Set(sortedGroups.map((group) => group.id));

    const predicateGroups = sortedGroups.map((group) => ({
      id: group.id,
      objectMetadataId: targetObjectMetadataId,
      parentRowLevelPermissionPredicateGroupId: group.parentRowLevelPermissionPredicateGroupId,
      logicalOperator: group.logicalOperator,
      positionInRowLevelPermissionPredicateGroup: group.positionInRowLevelPermissionPredicateGroup,
    }));

    const predicates = (predicatesByObjectId.get(sourceObjectMetadataId) ?? []).flatMap((predicate) => {
      const targetFieldMetadataId = targetFieldIdBySourceFieldId.get(predicate.fieldMetadataId);
      if (targetFieldMetadataId === undefined) {
        logger.warn(`Role "${role.label}": skipping row-level permission predicate - target field not found for field ${predicate.fieldMetadataId}`);
        return [];
      }
      const targetWorkspaceMemberFieldMetadataId = predicate.workspaceMemberFieldMetadataId !== null
        ? targetFieldIdBySourceFieldId.get(predicate.workspaceMemberFieldMetadataId) ?? null
        : null;
      return [{
        id: predicate.id,
        fieldMetadataId: targetFieldMetadataId,
        operand: predicate.operand,
        value: predicate.value,
        subFieldName: predicate.subFieldName,
        workspaceMemberFieldMetadataId: targetWorkspaceMemberFieldMetadataId,
        workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
        rowLevelPermissionPredicateGroupId: predicate.rowLevelPermissionPredicateGroupId !== null && resolvedGroupIds.has(predicate.rowLevelPermissionPredicateGroupId)
          ? predicate.rowLevelPermissionPredicateGroupId
          : null,
        positionInRowLevelPermissionPredicateGroup: predicate.positionInRowLevelPermissionPredicateGroup,
      }];
    });

    if (predicates.length === 0 && predicateGroups.length === 0) {
      continue;
    }

    try {
      await executeWithRetryAndCheckpoint(() =>
        upsertRowLevelPermissionPredicates(targetWorkspace, targetRoleId, targetObjectMetadataId, predicates, predicateGroups),
      );
    } catch (error) {
      logger.warn(`Role "${role.label}": skipping row-level permission predicates for object ${sourceObjectMetadataId} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

export const migrateRoles = async (
  targetWorkspace: AxiosInstance,
  sourceRoles: Role[],
  targetRoles: Role[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
) => {
  const targetRoleIdByLabel = new Map(targetRoles.map((role) => [role.label, role.id]));
  const sourceRolesToMigrate = sourceRoles.filter(role => targetRoleIdByLabel.has(role.label) === false);
  let createdCount = 0;

  for (const role of sourceRolesToMigrate) {
    const created = await executeWithRetry(() => createMetadataEntity(targetWorkspace, 'createOneRole', 'createRoleInput', 'CreateRoleInput', {
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
      await executeWithRetry(() =>
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
      await executeWithRetry(() => upsertObjectPermissions(targetWorkspace, targetRoleId, objectPermissions));
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

    if (role.rowLevelPermissionPredicates.length > 0 || role.rowLevelPermissionPredicateGroups.length > 0) {
      await migrateRowLevelPermissionPredicatesForRole(targetWorkspace, targetRoleId, role, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId);
    }

    if (await stopIfTimeBudgetExceeded()) {
      return false;
    }
  }

  setStateRef('migratedRoles', true);
  logger.log(`Roles: created ${createdCount}`);
  return true;
};